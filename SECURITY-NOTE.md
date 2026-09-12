# Repository data remediation

The production branch removes generated Daftra operational exports and runtime `.env` values from the current tree and prevents them from being committed again.

Deleting files in a new commit does **not** remove them from earlier Git history. Before public production sign-off, repository administrators must complete one of these remediations:

1. Make the repository private immediately, then rewrite Git history to purge generated operational data; or
2. Rewrite public history first and verify the sensitive paths are unreachable from all refs, forks/caches notwithstanding.

After the rewrite, force-push only after preserving a controlled backup and coordinating all active clones. Any credential that was committed as a secret must be rotated independently; history deletion is not credential rotation.

The Supabase browser publishable key is a client-side identifier by design, but runtime environment files are still excluded from source control so production configuration remains environment-specific.
