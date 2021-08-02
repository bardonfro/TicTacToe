'use strict'

//Module
const game = (function () {
    let _activePlayer = {};
    let _boardHeight = 3;
    let _boardWidth = 3;
    let _numOfPlayers = 2;
    let over = false;
    let _players = [];
    let playerSymbols = ["X", "O", "+", "*", "#", "@"];
    let ready = false;
    let _winningRun = 3;
    
    const _checkForDraw = function () {
        let claimedFields = 0;

        _players.forEach(function(player) {
            claimedFields = claimedFields + player.fields.length;
        })

        if (claimedFields >= _boardHeight * _boardWidth) {return true;}
        return false;

    }
    
    /* Checks for a winning run
        -Input: clicked cell, array of cells previously claimed, integer of the length of a winning run
        -Return: If the clicked cell makes a winning run, return is an array of the winning cells.
        -If the clicked cell is not part of a winning run, return is an empty array.
    */
    const _checkForRun = function (clickedCell,playersCells,winningRun) {
        // Vectors are the directions that need to be checked (will check both directions on a given line)
        const _vectors = [[1,0],[1,1],[0,1],[-1,1]];
        
        // A place to put winning cells
        const _winners = [];
    
        // Allows us to back up and find the beginning of the run
        const _invert = function (vector) {
            return [vector[0] * -1, vector[1] * -1];
        }
    
        // Checks if the next cell in the line is part of the set of cells already claimed by the player
        const _isNextClaimed = function (current, vector) {
            let next = playersCells.filter(function(claimed) {
                return claimed.x === current.x + vector[0] &&
                claimed.y === current.y + vector[1];
            })
            return next[0];
        }
    
        // For a given vector, what is the length of the run in both directions?
        const _checkLine = function(vector) {
            let current = clickedCell;
            let line = [];
            // Moves backward on the line to start at the beginning
            while (_isNextClaimed(current, _invert(vector))) {
                current = _isNextClaimed(current, _invert(vector));
            }
            
            //Moves forward on the line and adds claimed cells to the line array until it reaches an unclaimed cell
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

    /* Claims a field for the player and calculates game result
        -Input: object with properties x and y, representing coordinates of clicked cell
        -Return: undefined
        -Operation: 
            -Adds the cell to the players array
            -Tells the display to mark the cell as claimed
            -Checks for a run
            -Checks for a draw
            -If game is not over, advances the _activePlayer to the next player
    */
    const claimField = function(field) {
        _activePlayer.fields.push(field);
        display.markCell(field,_activePlayer.symbol)
        
        let arrWinners = _checkForRun(field,_activePlayer.fields,_winningRun);
        if (arrWinners.length > 0) {
            display.markWinners(arrWinners,_activePlayer.tile);
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
       game.over = false;
    }

    const newPlayer =  function (name, symbol, tile) {
        const player = {name, symbol};
        player.fields = [];
        player.tile = tile;
        _players.push(player);
        if (_players.length === _numOfPlayers) {
            game.ready = true;
        }
    }

    // Makes the next player the active player
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

   return {
    claimField,
    newGame,
    newPlayer,   
    numOfPlayers,
    over,
    playerSymbols,
    ready,
    returnActiveSymbol,
   }
})();

//Module
const display = (function(){

    let _cells = [];
    let _maxGameSize = 8;

    const clickCell = function (e) {
        const cell = e.target;
        if (cell.classList.contains("claimed") ||
            game.over) {return;}

        const coords = [Number(cell.dataset.column), Number(cell.dataset.row)];
        
        const field = {x:coords[0],y:coords[1]};
        game.claimField(field);
    }

    const _clickNewGame = function () {
        game.newGame();

        //Required for player-tile.winner
        document.querySelectorAll('.winner').forEach(function(el) {
            el.classList.remove('winner');
        })

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
    const markWinners = function(arrWinners,playerTile) {
        arrWinners.forEach(function(field) {
            const cell = _cells.filter(function(cell){
                return Number(cell.dataset.column) === field.x && 
                Number(cell.dataset.row) === field.y
            })[0]
            cell.classList.add("winner");
        })
        playerTile.classList.add('winner');
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

        const btnSubmit = document.createElement('button');
            btnSubmit.type = "submit";
            btnSubmit.textContent = "Add Player";
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

    /* Removes a player symbol from the remaining player(s) tiles option list
        when it is selected by another player
    */
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
        
        const boardWrapper = document.querySelector('#board-wrapper');
        
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
    }

    const _renderGameOptions = function () {
        const optionsPanel = _newElement('div', 'options-panel');
        document.querySelector('#options-wrapper').appendChild(optionsPanel);

        const btnStartGame = _newElement('button', 'button start-game-button no-display');
        btnStartGame.textContent = "New Game";
        btnStartGame.addEventListener('click', _clickNewGame)
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

    //Possible future development
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
        if (game.ready) {
            document.querySelector('.start-game-button').classList.remove('no-display');
        }

    };

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