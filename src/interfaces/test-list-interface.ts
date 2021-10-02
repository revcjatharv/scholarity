
export interface ITestList {
    date: Date,
    isConducted: boolean,
    isTestStarted: boolean,
    testName: string,
    testType: string,
    testDescription: string,
    testTime: string,
    maxPrize: number,
    minPrize: number,
    timer: number,
    totalQuestions: number,
    instruction: string,
    entryFee: number
}
