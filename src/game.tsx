import { PrimaryButton } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import React from 'react';
import { wordlist } from './data';

interface BoardValue {
    value: string;
    isInWord: boolean;
    isInPlace: boolean;
}

const wordLength = 5;
const numGuesses = 6;
const keybd1 = 'QWERTYUIOP';
const keybd2 = 'ASDFGHJKL';
const keybd3 = 'ZXCVBNM';
const back = 'BKSPC';
const enter = 'ENTER';

export function Game() {
    const [answer, setAnswer] = React.useState<string>(wordlist[Math.floor(Math.random() * wordlist.length)]);
    const [boardState, setBoardState] = React.useState<BoardValue[]>(getEmptyBoardState());
    const [currentRow, setCurrentRow] = React.useState<number>(0);
    const [currentColumn, setCurrentColumn] = React.useState<number>(0);
    const [guess, setGuess] = React.useState<string>('');
    const [focusBox, setFocusBox ] = React.useState<number>(0);
    const [isWin, setIsWin] = useBoolean(false);
    const [isOver, setIsOver] = useBoolean(false);

    const onBoxClick = React.useCallback((idx) => {
        // if the clicked box is in the current row, set the column pointer to it
        const currRowStart = currentRow * wordLength;
        if (idx >= currRowStart && idx < currRowStart + wordLength) {
            setFocusBox(idx);
            setCurrentColumn(idx - currRowStart);
        }
    }, [currentRow]);

    const onClickLetter = React.useCallback(letter => {
        let idx = currentRow * wordLength + currentColumn;
        const newBoardState = [...boardState];
        if (letter === back) {
            if (newBoardState[idx].value === '' && idx - 1 >= currentRow * wordLength) {
                idx = idx - 1;
                setCurrentColumn(currentColumn - 1);
            }
            newBoardState[idx].value = '';
            const newGuess = buildGuess(currentRow, boardState);
            setGuess(newGuess);  // remove last letter           
        } else {
            if (letter !== enter) {
                newBoardState[idx].value = letter;
                const newGuess = buildGuess(currentRow, boardState);
                setGuess(newGuess);
            }
            idx = idx + 1 < currentRow * wordLength + wordLength ? idx + 1 : idx;
            setCurrentColumn(currentColumn + 1 < wordLength ? currentColumn + 1 : wordLength - 1);
        }
        setBoardState(newBoardState);
        setFocusBox(idx);
    }, [boardState, currentColumn, currentRow]);

    const onSubmit = React.useCallback(() => {
        setCurrentRow(currentRow + 1);
        if (guess === answer) {
            setIsWin.setTrue();
            setIsOver.setTrue();
        } else if (currentRow === wordLength - 1) {
            // out of guesses, show answer
            const board = showAnswer(boardState, answer);
            setBoardState(board);
            setIsOver.setTrue();
        } else {
            const board = [...boardState];
            const answerLetters = [];
            const guessLetters = [];
            let idx = currentRow * wordLength;
            for (let i = 0; i < wordLength; i++) {
                answerLetters.push(answer.charAt(i));
                guessLetters.push(guess.charAt(i));
            }
            // first process all in-place letters
            for (let i = 0; i < wordLength; i++) {
                if (guess[i] === answer[i]) {
                    board[idx].isInWord = true;
                    board[idx].isInPlace = true;
                    answerLetters[i] = '';
                    guessLetters[i] = '';
                } else {
                    board[idx].isInPlace = false;
                }
                idx++;
            }
            // now check remaining letters to see if they are in the word but not in place
            idx = currentRow * wordLength;
            for (let i = 0; i < wordLength; i++) {
                if (guessLetters[i]) {
                    const pos = answerLetters.indexOf(guessLetters[i]);
                    if (pos > -1) {
                        board[idx].isInWord = true;
                        answerLetters[pos] = '';
                    } else {
                        board[idx].isInWord = false;
                    }
                } 
                idx++;
            }
            setBoardState(board);
            setCurrentColumn(0);
            setGuess('');
        }        
    }, [answer, boardState, currentRow, guess, setIsOver, setIsWin]);

    const onNewGame = React.useCallback(() => {
        let newAnswer = wordlist[Math.floor(Math.random() * wordlist.length)];
        while (newAnswer === answer) {
            newAnswer = wordlist[Math.floor(Math.random() * wordlist.length)];
        }
        setAnswer(newAnswer);
        setBoardState(getEmptyBoardState());
        setCurrentColumn(0);
        setCurrentRow(0);
        setFocusBox(0);
        setGuess('');
        setIsOver.setFalse();
        setIsWin.setFalse();
    }, [answer, setIsOver, setIsWin]);

    const disabled = React.useMemo(() => !wordlist.includes(guess), [guess]);

    const selections = React.useMemo(() => {
        // get the letters selected previously
        const selections: { [chr: string]: BoardValue } = {};
        for (let i = 0; i < currentRow * wordLength; i++) {
            const letter = boardState[i].value;
            selections[letter] = boardState[i];
        }
        return selections
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRow]);

    return (<div className='game'>
        {isWin && <div className='winner'>YOU WIN!</div>}
        {isOver && !isWin && <div className='not-winner'>SORRY, GAME OVER!</div>}
        <Board boardState={boardState} onBoxClick={onBoxClick} currentRow={currentRow} focusedIdx={focusBox}/>
        <div className='center'>
            {!isOver && <PrimaryButton onClick={onSubmit} text="Submit" className='button' disabled={disabled} />}
            {isOver && <PrimaryButton onClick={onNewGame} text="Play again?" className='button' />}
        </div>
        {!isOver && <Keyboard onClick={onClickLetter} selections={selections}/>} 
        <div>Answer: {answer}</div>
        <div>Guess: {guess}</div>
    </div>);
}

function buildGuess(currentRow: number, boardState: BoardValue[]) {
    const startIdx = currentRow * wordLength;
    let guess = '';
    for (let i = startIdx; i < startIdx + wordLength; i++) {
        guess += boardState[i].value;
    }
    return guess;
}

function showAnswer(boardState: BoardValue[], answer: string ) {
    const board = [...boardState];
    let idx = board.length - wordLength;
    for (let i = 0; i < answer.length; i++) {
        const chr = answer.charAt(i);
        board[idx++].value = chr;
    }
    return board;
}

interface BoardProps {
    boardState: BoardValue[];
    onBoxClick: (idx: number) => void;
    currentRow: number;
    focusedIdx: number;
}

function Board(props: BoardProps) {

    const { boardState, onBoxClick, currentRow, focusedIdx } = props;

    const board: JSX.Element[] = [];
    for (let row = 0; row < numGuesses; row++) {
        const columns = [];
        for (let col = 0; col < wordLength; col++) {
            const idx = wordLength * row + col;
            const key = `box-${idx}`;
            const classList = `box ${boardState[idx].isInWord ? ' yellow' : ''} ${boardState[idx].isInPlace ? ' green' : ''} ${idx === focusedIdx ? ' focused' : ''}`;
            columns.push(
                <div id={key} key={key} className={classList} onClick={() => onBoxClick(idx)}>
                    {boardState[idx].value}
                </div>
                );
        }
        board.push(<div key={`key-row${row}`} className='row'>
            <div className='row-marker'>
                {currentRow === row && <div className='arrow-right'></div>}
            </div>
            {columns}
        </div>);
    }

    return <div className='board'>{board}</div>;
}

function getEmptyBoardState() {
    const board = [];
    for (let i = 0; i < 30; i++) {
        board[i] = { value: '', isInWord: false, isInPlace: false };
    }
    return board;
}

interface KeyboardProps {
    onClick: (letter: string) => void;
    selections: { [chr: string]: BoardValue };
}

function Keyboard({ onClick, selections }: KeyboardProps) {
    const rows: JSX.Element[][] = [[],[],[]];
    for (let i = 0; i < keybd1.length; i++) {
        const chr = keybd1.charAt(i);
        const inWord = selections[chr]
            ? selections[chr].isInWord 
                ? ' yellow' 
                : ' gray'
            : '';
        const className = `box key ${inWord} ${selections[chr]?.isInPlace ? ' green' : ''}`;
        rows[0].push(<div key={`key-${chr}`} className={className} onClick={() => onClick(chr)}>{chr}</div>);
    }
    for (let i = 0; i < keybd2.length; i++) {
        const chr = keybd2.charAt(i);
        const inWord = selections[chr]
            ? selections[chr].isInWord 
                ? ' yellow' 
                : ' gray'
            : '';
        const className = `box key ${inWord} ${selections[chr]?.isInPlace ? ' green' : ''}`;
        rows[1].push(<div key={`key-${chr}`} className={className} onClick={() => onClick(chr)}>{chr}</div>);
    }
    for (let i = 0; i < keybd3.length; i++) {
        const chr = keybd3.charAt(i);
        const inWord = selections[chr]
            ? selections[chr].isInWord 
                ? ' yellow' 
                : ' gray'
            : '';
        const className = `box key ${inWord} ${selections[chr]?.isInPlace ? ' green' : ''}`;
        rows[2].push(<div key={`key-${chr}`} className={className} onClick={() => onClick(chr)}>{chr}</div>);
    }
    return (<div className='keyboard'>
        <div className='row key-row'>
            {rows[0]}
        </div>
        <div className='row key-row'>
            {rows[1]}
        </div>
        <div className='row key-row'>
            <div key={`key-${enter}`} className='box key special' onClick={(() => onClick(enter))}>{enter}</div>
            {rows[2]}
            <div key={`key-${back}`} className='box key special' onClick={(() => onClick(back))}>{back}</div>
        </div>
    </div>);
}