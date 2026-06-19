#!/usr/bin/env python3
import argparse
import json
import os
import sys
import urllib.parse
import urllib.request


def fail(message: str) -> None:
    print(message, file=sys.stderr)
    raise SystemExit(1)


def fetch_secret(base_url: str, access_token: str, project_id: str, environment: str, secret_path: str, secret_name: str, timeout: float) -> str:
    query = urllib.parse.urlencode({
        "projectId": project_id,
        "environment": environment,
        "secretPath": secret_path,
    })
    url = f"{base_url.rstrip('/')}/api/v4/secrets/{urllib.parse.quote(secret_name, safe='')}?{query}"
    request = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {access_token}"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", "ignore")
        fail(f"Failed to fetch {secret_name}: HTTP {exc.code} {body}")
    except TimeoutError:
        fail(f"Timed out fetching {secret_name} from {base_url}")
    except OSError as exc:
        fail(f"Failed to fetch {secret_name} from {base_url}: {exc}")
    secret = (payload.get("secret") or {}).get("secretValue")
    if secret is None:
        fail(f"Secret {secret_name} did not include a secretValue")
    return str(secret)


def append_github_env(github_env: str, key: str, value: str) -> None:
    with open(github_env, "a", encoding="utf-8") as fh:
        fh.write(f"{key}<<__PARLE_EOF__\n{value}\n__PARLE_EOF__\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fetch exact Infisical secrets for CI runtime use")
    parser.add_argument("secret_names", nargs="+", help="Secret names to fetch and emit")
    parser.add_argument("--base-url", default=os.environ.get("INFISICAL_URL", "https://vault.parle.dev"))
    parser.add_argument("--access-token", default=os.environ.get("INFISICAL_CI_ACCESS_TOKEN", ""))
    parser.add_argument("--project-id", default=os.environ.get("INFISICAL_PROJECT_ID", ""))
    parser.add_argument("--environment", default=os.environ.get("INFISICAL_ENVIRONMENT", "prod"))
    parser.add_argument("--secret-path", default=os.environ.get("INFISICAL_SECRET_PATH", "/"))
    parser.add_argument("--github-env", default=os.environ.get("GITHUB_ENV", ""))
    parser.add_argument("--timeout", type=float, default=float(os.environ.get("INFISICAL_FETCH_TIMEOUT", "20")))
    args = parser.parse_args()

    access_token = args.access_token.strip()
    project_id = args.project_id.strip()
    secret_path = args.secret_path.strip()
    github_env = args.github_env.strip()

    if not access_token:
        fail("INFISICAL_CI_ACCESS_TOKEN is required")
    if not project_id:
        fail("INFISICAL_PROJECT_ID is required")
    if not github_env:
        fail("GITHUB_ENV is required")

    if not secret_path.startswith("/"):
        secret_path = f"/{secret_path}"

    for secret_name in args.secret_names:
        value = fetch_secret(
            args.base_url.strip(),
            access_token,
            project_id,
            args.environment.strip(),
            secret_path,
            secret_name,
            args.timeout,
        )
        append_github_env(github_env, secret_name, value)
        print(f"Fetched {secret_name} into GITHUB_ENV", file=sys.stderr)


if __name__ == "__main__":
    main()
