
export interface IUserTest {
    userId : string,
    testId: string,
    qARounds: qARounds [],
    totalMarks: number,
    winAmount: number,
    rank: number
}

export interface qARounds {
    questionNumber: string,
    question: string,
    isAnsCorrect: boolean,
    userAns: string,
    timeTaken: Date,
    actualAns: string
}
