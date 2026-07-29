#!/usr/bin/env python3
"""Drives install.sh under a pty to answer a single conflict prompt.

install.sh reads the conflict answer from /dev/tty (not stdin) and checks
`[ -t 0 ]` to decide whether it's interactive at all, so a real pty is
required to exercise the override/append code paths.

Waits for --wait to appear in the child's output before sending --send as
a single keystroke, rather than sending on a fixed delay. This matters
because install.sh iterates a bash associative array in undefined order,
so an unpredictable number of [linked]/[up-to-date] lines can precede the
one conflict prompt -- there is no fixed byte offset or timing to key off.
"""
import argparse
import os
import pty
import select
import signal
import sys
import time
import warnings

warnings.filterwarnings("ignore", category=DeprecationWarning)


def _finish(pid, status, transcript):
    sys.stdout.buffer.write(transcript)
    if os.WIFEXITED(status):
        sys.exit(os.WEXITSTATUS(status))
    if os.WIFSIGNALED(status):
        sys.exit(128 + os.WTERMSIG(status))
    sys.exit(1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--home", required=True)
    parser.add_argument("--install", required=True)
    parser.add_argument("--wait", required=True)
    parser.add_argument("--send", required=True)
    parser.add_argument("--timeout", type=float, default=15.0)
    args = parser.parse_args()

    pid, master_fd = pty.fork()
    if pid == 0:
        os.environ["HOME"] = args.home
        os.execvp("bash", ["bash", args.install])
        os._exit(127)

    wait_bytes = args.wait.encode()
    send_bytes = args.send.encode()
    transcript = b""
    sent = False
    deadline = time.time() + args.timeout

    while True:
        remaining = deadline - time.time()
        if remaining <= 0:
            os.kill(pid, signal.SIGKILL)
            os.waitpid(pid, 0)
            sys.stdout.buffer.write(transcript)
            sys.exit(124)

        r, _, _ = select.select([master_fd], [], [], remaining)
        if master_fd in r:
            try:
                chunk = os.read(master_fd, 4096)
            except OSError:
                chunk = b""
            if chunk:
                transcript += chunk
                if not sent and wait_bytes in transcript:
                    os.write(master_fd, send_bytes)
                    sent = True
            else:
                # EOF: the child's pty slave closed, which only happens once
                # the child (and anything it forked) has exited. waitpid can
                # race the WNOHANG check below, so reap directly here instead
                # of falling through and losing the transcript/exit status.
                _, status = os.waitpid(pid, 0)
                _finish(pid, status, transcript)

        finished_pid, status = os.waitpid(pid, os.WNOHANG)
        if finished_pid == pid:
            # Drain any trailing output emitted right before exit.
            while True:
                r, _, _ = select.select([master_fd], [], [], 0.2)
                if master_fd not in r:
                    break
                try:
                    chunk = os.read(master_fd, 4096)
                except OSError:
                    break
                if not chunk:
                    break
                transcript += chunk
            _finish(pid, status, transcript)


if __name__ == "__main__":
    main()
