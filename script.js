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
    
    const _maxGameSize = 16;

    const logFields = function () {
            console.table(_fields);
    }

    /* New Game
        - Input: 
        - Clear game

    */
    const logPlayers = function () {
        console.table(_players);
    }
   
    const newGame = function (width,height) {
       display.renderGameBoard(width,height);
    }

    const newPlayer =  function (name, symbol) {
        const player = {name, symbol};
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

    /* Create a game board
        - Input: (integer:width, integer:height)
        - Clear current game
        - Create fields and add to array
        - Pass fields array to display for rendering
    */

    const _createField = function(x,y) {
        const field = {x,y,source:"game"};
        return field;
    }

    const createGameBoard = function (width, height) {
        _clearGame();
        if (!(0 < width < _maxGameSize) && !(0 < height < _maxGameSize)) {
            console.log("Error: Incorrect game size");
            return;
        }
        let row = 0;
        while (row < height) {
            let column = 0;
            while (column < width) {
                _fields.push(_createField(column,row));
                column++;
            }

            row++;
        }
        

    }

    /* Create a field
        - Input: coords
        - Set x and y
        - Set player to null
        - Return field
    */

    /* Claim a cell
        - Input: field, player
        - Verifies that field is unclaimed
        - Set field.player
        - Send field, player to display.(mark field)
        - Check for draw
        - Check for win
        - Set game phase to either turn, win, or draw 
        - Send game phase to display
    */

    // Checks for win

    /* Check for a draw
        - Returns true if all fields have a player
        - Returns fals if not all fields have a pl;ayer

    
    */
   return {
    logPlayers,
    newGame,
    newPlayer,   
    numOfPlayers,
    playerSymbols,
    logFields,
   }
})();

//Module
const display = (function(){

    let _cells = [];

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
        const coords = [cell.dataset.column, cell.dataset.row];
        console.log(coords);
    }

    const initialize = function () {
        renderPlayerTiles(game.numOfPlayers());
    };

    const markCell = function (x,y,symbol) {
        let cell = false;
        let i = 0;
        while ((i <= _cells.length) && !(cell)) {
            if (Number(_cells[i].dataset.column) === x &&
                Number(_cells[i].dataset.row) === y ) {
                    cell = _cells[i];
            }
        }
        if (!cell) {return;}
        cell.classList.add('claimed');
        cell.textContent = symbol;
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