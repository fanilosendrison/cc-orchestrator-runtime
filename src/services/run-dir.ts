export function resolveRunDir(
	_cwd: string,
	_orchestratorName: string,
	_runId: string,
): string {
	throw new Error("Not implemented");
}

export function cleanupOldRuns(
	_cwd: string,
	_orchestratorName: string,
	_retentionDays: number,
	_currentRunId: string,
): number {
	throw new Error("Not implemented");
}
