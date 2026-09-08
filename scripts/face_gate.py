#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["opencv-contrib-python"]
# ///

"""Open VS Code only after a local webcam face verification.

Usage:
    uv run scripts/face_gate.py enroll
    uv run scripts/face_gate.py

The enrollment and recognition model are stored under %LOCALAPPDATA%\\NumiFaceGate.
This is a convenience gate, not a security boundary: someone who starts Code.exe
directly (or has administrator access) can bypass it. Use this script as the target
of your VS Code desktop/taskbar shortcut.
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

import cv2
import numpy as np


APP_DIRECTORY_NAME = "NumiFaceGate"
MODEL_FILENAME = "face_model.yml"
WINDOW_NAME = "Numi Face Gate"
DEFAULT_CAMERA_INDEX = 0
ENROLLMENT_SAMPLES = 30
MATCHES_REQUIRED = 3
DEFAULT_TIMEOUT_SECONDS = 15
# LBPH confidence is a distance: lower is a better match. Tune only if needed.
DEFAULT_MATCH_THRESHOLD = 65.0


class FaceGateError(Exception):
    """Raised when face verification cannot safely continue."""


def application_directory() -> Path:
    """Return the private directory used for the local biometric model."""
    local_app_data = os.environ.get("LOCALAPPDATA")
    if not local_app_data:
        raise FaceGateError("LOCALAPPDATA is unavailable; cannot choose a safe data directory.")

    directory = Path(local_app_data) / APP_DIRECTORY_NAME
    directory.mkdir(parents=True, exist_ok=True)
    return directory


def cascade_classifier() -> cv2.CascadeClassifier:
    """Load OpenCV's bundled frontal-face detector."""
    cascade_path = Path(cv2.data.haarcascades) / "haarcascade_frontalface_default.xml"
    detector = cv2.CascadeClassifier(str(cascade_path))
    if detector.empty():
        raise FaceGateError(f"Could not load the face detector from {cascade_path}.")
    return detector


def largest_face(frame: cv2.typing.MatLike, detector: cv2.CascadeClassifier) -> cv2.typing.MatLike | None:
    """Return a normalized crop of the largest detected face, if there is one."""
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = detector.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=6, minSize=(100, 100))
    if len(faces) == 0:
        return None

    x, y, width, height = max(faces, key=lambda face: int(face[2]) * int(face[3]))
    face_crop = gray_frame[y : y + height, x : x + width]
    return cv2.resize(face_crop, (200, 200), interpolation=cv2.INTER_AREA)


def open_camera(camera_index: int) -> cv2.VideoCapture:
    """Open a webcam and raise a clear error when it is unavailable."""
    camera = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
    if not camera.isOpened():
        camera.release()
        raise FaceGateError(f"Could not open camera {camera_index}. Check camera permissions and try again.")
    return camera


def show_frame(frame: cv2.typing.MatLike, status: str) -> int:
    """Display a frame with status text and return the pressed key code."""
    displayed_frame = frame.copy()
    cv2.putText(
        displayed_frame,
        status,
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.75,
        (0, 255, 0),
        2,
        cv2.LINE_AA,
    )
    cv2.imshow(WINDOW_NAME, displayed_frame)
    return cv2.waitKey(1) & 0xFF


def cleanup_camera(camera: cv2.VideoCapture) -> None:
    """Release the webcam and close the verification window."""
    camera.release()
    cv2.destroyAllWindows()


def create_recognizer() -> cv2.face_LBPHFaceRecognizer:
    """Create the OpenCV-contrib LBPH recognizer required by this script."""
    if not hasattr(cv2, "face"):
        raise FaceGateError("opencv-contrib-python is required; run this script with uv as shown above.")
    return cv2.face.LBPHFaceRecognizer_create()


def enroll(camera_index: int) -> None:
    """Capture face samples and replace the prior local recognition model."""
    detector = cascade_classifier()
    camera = open_camera(camera_index)
    samples: list[cv2.typing.MatLike] = []

    print("Enrollment started. Face the camera and slowly turn your head. Press Esc to cancel.")
    try:
        while len(samples) < ENROLLMENT_SAMPLES:
            success, frame = camera.read()
            if not success:
                raise FaceGateError("The camera stopped returning frames during enrollment.")

            face = largest_face(frame, detector)
            if face is not None:
                samples.append(face)

            key = show_frame(frame, f"Enrolling: {len(samples)}/{ENROLLMENT_SAMPLES}  (Esc cancels)")
            if key == 27:
                print("Enrollment cancelled; the existing model was left unchanged.")
                return
    finally:
        cleanup_camera(camera)

    recognizer = create_recognizer()
    labels = [0] * len(samples)
    recognizer.train(samples, np.array(labels))
    model_path = application_directory() / MODEL_FILENAME
    recognizer.write(str(model_path))
    print(f"Enrollment complete. Your local model was saved to {model_path}.")


def authenticate(camera_index: int, threshold: float, timeout_seconds: int) -> bool:
    """Verify consecutive face matches against the enrolled local model."""
    model_path = application_directory() / MODEL_FILENAME
    if not model_path.is_file():
        raise FaceGateError("No enrolled face was found. Run: uv run scripts/face_gate.py enroll")

    recognizer = create_recognizer()
    recognizer.read(str(model_path))
    detector = cascade_classifier()
    camera = open_camera(camera_index)
    matches = 0
    deadline = time.monotonic() + timeout_seconds

    print("Looking for your face. Press Esc to cancel.")
    try:
        while time.monotonic() < deadline:
            success, frame = camera.read()
            if not success:
                raise FaceGateError("The camera stopped returning frames during verification.")

            face = largest_face(frame, detector)
            is_match = False
            confidence_text = "face not found"
            if face is not None:
                label, distance = recognizer.predict(face)
                is_match = label == 0 and distance <= threshold
                confidence_text = f"distance: {distance:.1f}"

            matches = matches + 1 if is_match else 0
            remaining = max(0, int(deadline - time.monotonic()))
            status = f"Checking {matches}/{MATCHES_REQUIRED} | {confidence_text} | {remaining}s | Esc cancels"
            if show_frame(frame, status) == 27:
                return False
            if matches >= MATCHES_REQUIRED:
                return True
    finally:
        cleanup_camera(camera)

    return False


def find_vscode(vscode_path: str | None) -> Path:
    """Resolve a requested or standard Windows installation of VS Code."""
    if vscode_path:
        candidate = Path(vscode_path).expanduser()
        if candidate.is_file():
            return candidate
        raise FaceGateError(f"VS Code was not found at: {candidate}")

    code_command = shutil.which("code.cmd") or shutil.which("code")
    if code_command:
        return Path(code_command)

    program_files = [os.environ.get("LOCALAPPDATA"), os.environ.get("ProgramFiles"), os.environ.get("ProgramFiles(x86)")]
    for root in filter(None, program_files):
        candidate = Path(root) / "Programs" / "Microsoft VS Code" / "Code.exe"
        if candidate.is_file():
            return candidate
        candidate = Path(root) / "Microsoft VS Code" / "Code.exe"
        if candidate.is_file():
            return candidate

    raise FaceGateError("VS Code was not found. Pass its path with --vscode-path.")


def parse_arguments() -> argparse.Namespace:
    """Parse command-line options for enrollment and launching."""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("command", nargs="?", choices=("enroll", "open"), default="open")
    parser.add_argument("--camera", type=int, default=DEFAULT_CAMERA_INDEX, help="Webcam index (default: 0).")
    parser.add_argument("--vscode-path", help="Full path to Code.exe when it cannot be found automatically.")
    parser.add_argument("--threshold", type=float, default=DEFAULT_MATCH_THRESHOLD, help="Maximum match distance.")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT_SECONDS, help="Verification time limit in seconds.")
    return parser.parse_args()


def main() -> int:
    """Enroll a face or authenticate and launch VS Code."""
    arguments = parse_arguments()
    if arguments.command == "enroll":
        enroll(arguments.camera)
        return 0

    if authenticate(arguments.camera, arguments.threshold, arguments.timeout):
        vscode = find_vscode(arguments.vscode_path)
        subprocess.Popen([str(vscode)], close_fds=True)
        print("Face verified. VS Code is opening.")
        return 0

    print("Face verification failed or was cancelled. VS Code was not opened.", file=sys.stderr)
    return 1


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except FaceGateError as error:
        print(f"Face gate error: {error}", file=sys.stderr)
        raise SystemExit(2) from error
