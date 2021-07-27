'use strict'

// DOM Elements
const boardWrapper = document.querySelector('#board-wrapper');

// Event listeners for buttons
const btnReset = {};


//Module
const game = (function () {
    let _fields = [];
    let _players = [];
    let _phase = "";
    let _numOfPlayers = 2;
    let playerSymbols = ["X", "O", "+", "*", "#", "@"];
    let _activePlayer = {fields:[],symbol:"X"};
    
    const _winningRun = 3;
    const _maxGameSize = 16;

    const _checkForRun = function (clickedCell,cohort,winningRun) {
        // Vectors are the directions that need to be checked
        const _vectors = [[1,0],[1,1],[0,1],[-1,1]];
        
        // A place to put winning cells
        const _winners = [];
    
        // Allows us to back up and find the beginning of the run
        const _invert = function (vector) {
            return [vector[0] * -1, vector[1] * -1];
        }
    
        // Checks if the next cell in the line is part of the cohort
        const _isNextClaimed = function (current, vector) {
            let next = cohort.filter(function(claimed) {
                return claimed.x === current.x + vector[0] &&
                claimed.y === current.y + vector[1];
            })
            return next[0];
        }
    
        // For a given vector, what is the length of the run?
        const _checkLine = function(vector) {
            let current = clickedCell;
            let line = [];
            while (_isNextClaimed(current, _invert(vector))) {
                current = _isNextClaimed(current, _invert(vector));
            }
    
            while (current) {
                line.push(current);
                current = _isNextClaimed(current, vector);
            }
            return line;
        }
        
        _vectors.forEach(function(vector) {
            const line = _checkLine(vector);
            if (line.length >= winningRun) {
                line.forEach(function(cell) {
                    _winners.push(cell);
                })
            }
            
        });
    return _winners;
    
    }

    const claimField = function(field) {
        _activePlayer.fields.push(field);
        display.markCell(field,_activePlayer.symbol)
        
        let arrWinners = _checkForRun(field,_activePlayer.fields,_winningRun);
        if (arrWinners.length > 0) {
            display.markWinners(arrWinners);
        }
    }

    const newGame = function (width,height) {
       display.renderGameBoard(width,height);
    }

    const newPlayer =  function (name, symbol) {
        const player = {name, symbol};
        player.fields = [];
        _players.push(player);
        return player;
    }

    const numOfPlayers = function() {
        return _numOfPlayers;
    }

    /* Clear
        - Clear fields and players arrays
        - Signal the display to clear
    */
   const _clearGame = function () {
       //clears game
   }

    /* Check for a draw
        - Returns true if all fields have a player
        - Returns fals if not all fields have a pl;ayer

    
    */
   return {
    claimField,
    newGame,
    newPlayer,   
    numOfPlayers,
    playerSymbols,
   }
})();

//Module
const display = (function(){

    let _cells = [];
    let _maxGameSize = 8;

    /* Clear the display
        - Delete the tiles
        - Delete the player display
        - Display game start options
    */
    
    /* Create new player tiles
        - Input: number of players
        - Creates tiles with forms for player name and symbol
        - Assigns event listener to form submit buttons
    */

    const clickCell = function (e) {
        const cell = e.target;
        if (cell.classList.contains("claimed")) {return;}
        const coords = [Number(cell.dataset.column), Number(cell.dataset.row)];
        
        const field = {x:coords[0],y:coords[1]};
        game.claimField(field);
    }

    const initialize = function () {
        renderPlayerTiles(game.numOfPlayers());
    };

    /* Marks a cell as claimed by a player
        - Sets text content to player's symbol
        - Adds "claimed" class to cell
        - Input:
            - field object with properties "x" and "y"
            - symbol string
    
    */
    const markCell = function (field,symbol) {
        let cell = false;
        let i = 0;
        while ((i < _cells.length) && !(cell)) {
            if (Number(_cells[i].dataset.column) === field.x &&
                Number(_cells[i].dataset.row) === field.y ) {
                    cell = _cells[i];
            }
            i++;
        }
        if (!cell) {return;}
        cell.classList.add('claimed');
        cell.textContent = symbol;
    }

    /* Adds "winner" class to winning cells
        -Input: array of objects with properties "x" and "y"
        -Also uses display._cells array

    */
    const markWinners = function(arrWinners) {
        arrWinners.forEach(function(field) {
            const cell = _cells.filter(function(cell){
                return Number(cell.dataset.column) === field.x && 
                Number(cell.dataset.row) === field.y
            })[0]
            cell.classList.add("winner");

        })
    }
           
    const _newElement = function(tag, classes) {
        const element = document.createElement(tag);
        element.classList = classes;
        return element;
    };

    const _newPlayerForm = function () {
        const form = document.createElement('form');
        form.classList = "new-player-form";
        form.setAttribute("onSubmit", "return false");
        form.addEventListener('submit', display.submitForm);

        const nameLabel = document.createElement('label');
            nameLabel.htmlFor = "player-name";
            nameLabel.textContent = "Player Name";
        form.appendChild(nameLabel);
        const nameField = document.createElement('input');
            nameField.required = true;
            nameField.name = "player-name";
        form.appendChild(nameField);
        
        const symbolLabel = document.createElement('label');
            symbolLabel.htmlFor = "player-symbol";
            symbolLabel.textContent = "Symbol";
        form.appendChild(symbolLabel);

        const symbolField = document.createElement('select');
            symbolField.required = true;
            symbolField.name = "player-symbol";

            game.playerSymbols.slice(0,game.numOfPlayers).forEach(function (symbol) {
                const option = document.createElement('option');
                option.classList = 'player-symbol-choice';
                option.value = option.textContent = symbol;
                symbolField.appendChild(option);
            })
        form.appendChild(symbolField);

        const btnSubmit = document.createElement('input');
            btnSubmit.type = "submit";
            btnSubmit.value = "Add Player";
        form.appendChild(btnSubmit);

        return form;
    };

    const _newPlayerTile = function () {

        const tile = _newElement('div', 'player-tile');
        tile.appendChild(_newElement('h3', 'player-name no-display'));
        tile.appendChild(_newElement('h4','player-symbol no-display'));
        tile.appendChild(_newPlayerForm());
        return tile;
    };


    const _removeSymbolOption = function (sym) {
        const options = document.querySelectorAll('.player-symbol-choice');
        options.forEach(function(element) {
            if (element.value === sym) {
                element.parentElement.removeChild(element);
            }

        })
    };
    
    const renderGameBoard = function(width,height) {
        if (width > _maxGameSize || height > _maxGameSize) {return;}

        boardWrapper.textContent = "";            
        _cells = [];

        const board = _newElement('div', 'board')
        boardWrapper.appendChild(board);
        
        for (let i = 0; i < width; i++){
            const column = _newElement('div', 'game-column');
            board.appendChild(column);
            for (let j = 0; j < height; j++) {
                const cell = _newElement('div', 'cell');
                cell.dataset.column = i;
                cell.dataset.row = j;
                cell.textContent = i + "," + j;
                cell.addEventListener('click',display.clickCell)
                column.appendChild(cell);
                _cells.push(cell);
            }
        }
   }

    const renderPlayerTiles = function (num) {
        let count = 0;
        const playerWrapper = document.querySelector("#player-wrapper");
        while (count < num) {
            playerWrapper.appendChild(_newPlayerTile());
            ++count;
        }
    };

    const submitNewPlayer = function (e) {
        const form = e.srcElement;
        const name = form[0].value;
        const symbol = form[1].value;

        const player = game.newPlayer(name, symbol);
        const tile = form.parentElement;
        tile.querySelector('.player-name').textContent = player.name;
        tile.querySelector('.player-symbol').textContent = player.symbol;
        tile.querySelector('.player-name').classList.remove('no-display');
        tile.querySelector('.player-symbol').classList.remove('no-display');
        
        form.classList.add('no-display');
        _removeSymbolOption(symbol);

    };

    /* Create new player
        - Trigger: New player form submit click
        - Gets information from form
        - Submits information to game.newPlayer
        - Associates tile and player
        - Changes the new player tile to a player tile
    */
    
    /* Place a symbol in a tile
        - Input: field, player
        - looks up player symbol
        - looks us field's tile
        - sets tile text content to symbol
        - changes classes as needed
    */

    /* Illuminate a winning set
        - Input: winning fields, player
        - Sets class of corresponding tiles to win class
        - Highlights player tile, displays win message
        - Displays appropriate player action buttons 
    */

    /* Signal game when a cell has been clicked
        -Passes tile.field to game logic
    */

    /* Set game phase
        - Input:
        - Sets

    */

    return {
        clickCell,
        initialize,
        markCell,
        markWinners,
        renderGameBoard,
        renderPlayerTiles,
        submitForm: submitNewPlayer,
    }
})();

display.initialize();
game.newGame(3,3);

//Development hacks and shortuts

const who = function() {
    game.logPlayers();
}

let arr = [1,2,3]

let mult = function(a) {
    times([...arr]);
    console.table(arr);
}
let times = function (b) {
    b.forEach(function(x) {x = x * 10});
    console.table(b);
}

