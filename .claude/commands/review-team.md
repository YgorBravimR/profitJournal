Create an agent team to explore coordinate multiple agents reviewing the code:
First will use the i18n-translator agent to check for missing points of translation on code,
another will use the @react-guidelines-enforcer agent to ensure we are following patterns,
another will use @code-simplifier to look for simplifications on code and the last will use
@git-commit-helper to handle the commit phase. The commit message should be about the changes
done on code, the diff files, not about what the reviewers did.

Focus on: $ARGUMENTS
