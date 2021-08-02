'use strict'

// DOM Elements
const boardWrapper = document.querySelector('#board-wrapper');

// Event listeners for buttons
const btnReset = {};


//Module
const game = (function () {
    let _boardWidth = 3;
    let _boardHeight = 3;
    let _players = [];
    let _numOfPlayers = 2;
    let over = false;
    let playerSymbols = ["X", "O", "+", "*", "#", "@"];
    let _activePlayer = {};
    
    const _winningRun = 3;
    const _maxGameSize = 16;

    const _checkForDraw = function () {
        let claimedFields = 0;

        _players.forEach(function(player) {
            claimedFields = claimedFields + player.fields.length;
        })

        if (claimedFields >= _boardHeight * _boardWidth) {return true;}
        return false;

    }
    
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
            over = true;
        } else if (_checkForDraw()) {
            _setActivePlayer(null);
            display.showDraw();
        } else {
            _nextPlayer();
        }
    }

    const newGame = function () {
        if (!(_numOfPlayers === _players.length)) {return;}
        _players.forEach(function(player) {
            player.fields = [];
        })
       display.renderGameBoard(_boardWidth,_boardHeight);
       _setActivePlayer(_players[0]);
       over = false;
    }

    const newPlayer =  function (name, symbol, tile) {
        const player = {name, symbol};
        player.fields = [];
        player.tile = tile;
        _players.push(player);
    }

    const _nextPlayer = function() {
        const current = _players[0];
        _players = _players.slice(1);
        _players.push(current);
        _setActivePlayer(_players[0])
    }

    const numOfPlayers = function() {
        return _numOfPlayers;
    }

    const returnActiveSymbol = function() {
        return _activePlayer.symbol;
    }

    const _setActivePlayer = function(player) {
        _players.forEach(function(player) {
            player.tile.classList.remove('active-player');
        })
        _activePlayer = player;

        if (player) {
            player.tile.classList.add('active-player');
        }
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
    over,
    playerSymbols,
    returnActiveSymbol,
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
        if (cell.classList.contains("claimed") ||
            game.over) {return;}

        const coords = [Number(cell.dataset.column), Number(cell.dataset.row)];
        
        const field = {x:coords[0],y:coords[1]};
        game.claimField(field);
    }

    const _clickStartGame = function () {
        console.log("Start Game");
    }

    const initialize = function () {
        _renderPlayerTiles(game.numOfPlayers());
        _renderGameOptions();
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
        game.over = true;
    }
    
    const _mouseOverCell = function(e) {
        const cell = e.target;
        if (cell.classList.contains('claimed') ||
            game.over) {return;}

        cell.classList.add('hover')
        cell.textContent = game.returnActiveSymbol();
    }

    const _mouseOutCell = function (e) {
        const cell = e.target;
        if (cell.classList.contains('claimed') ||
            game.over) {return;}

        cell.classList.remove('hover')
        cell.textContent ='';

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

        const header = _newElement('h3', "form-header");
            header.textContent = "Add Player"
            form.appendChild(header);

        const nameField = document.createElement('input');
            nameField.required = true;
            nameField.name = "player-name";
            nameField.placeholder = "Enter Name"
        form.appendChild(nameField);
        
        const symbolWrapper = _newElement('div', 'symbol-wrapper');
        form.appendChild(symbolWrapper);

        const symbolLabel = document.createElement('label');
            symbolLabel.htmlFor = "player-symbol";
            symbolLabel.textContent = "Symbol";
        symbolWrapper.appendChild(symbolLabel);

        const symbolField = document.createElement('select');
            symbolField.required = true;
            symbolField.name = "player-symbol";

            game.playerSymbols.slice(0,game.numOfPlayers()).forEach(function (symbol) {
                const option = document.createElement('option');
                option.classList = 'player-symbol-choice';
                option.value = option.textContent = symbol;
                symbolField.appendChild(option);
            })
        symbolWrapper.appendChild(symbolField);

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
        tile.appendChild(_newElement('div','form-wrapper')).appendChild(_newPlayerForm());
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
                cell.addEventListener('click',display.clickCell);
                cell.addEventListener('mouseover', _mouseOverCell);
                cell.addEventListener('mouseout', _mouseOutCell);
                column.appendChild(cell);
                _cells.push(cell);
            }
        }
        game.over = false;
    }

    const _renderGameOptions = function () {
        const optionsPanel = _newElement('div', 'options-panel');
        document.querySelector('#options-wrapper').appendChild(optionsPanel);

        const numberOfPlayersWrapper = _newElement('div', 'options-wrapper');
            //optionsPanel.appendChild(numberOfPlayersWrapper);
            const numLabel = _newElement('label', '');
                numLabel.htmlFor = "number-players"
                numLabel.textContent = "Number of Players";
                numberOfPlayersWrapper.appendChild(numLabel);
            const numSelect = _newElement('select','num-players-select');
                //Unfinished

        

        
        
        const btnStartGame = _newElement('div', 'button start-game-button');
            btnStartGame.textContent = "New Game";
            btnStartGame.addEventListener('click', game.newGame)
            optionsPanel.appendChild(btnStartGame);
    }

    const _renderPlayerTiles = function (num) {
        let count = 0;
        const playerWrapper = document.querySelector("#player-wrapper");
        while (count < num) {
            playerWrapper.appendChild(_newPlayerTile());
            ++count;
        }
    };

    const showDraw = function () {
        console.log("draw");
    }

    const submitNewPlayer = function (e) {
        const form = e.srcElement;
        const name = form[0].value;
        const symbol = form[1].value;
        const tile = form.parentElement.parentElement;

        const player = game.newPlayer(name, symbol,tile);
        tile.querySelector('.player-name').textContent = name;
        tile.querySelector('.player-symbol').textContent = symbol;
        tile.querySelector('.player-name').classList.remove('no-display');
        tile.querySelector('.player-symbol').classList.remove('no-display');
        
        form.parentElement.classList.add('no-display');
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
        showDraw,
        submitForm: submitNewPlayer,
    }
})();

display.initialize();