'use strict';
var turn = document.getElementById('turn');
var board = document.getElementById('board');
var activePiece = null;
var movePlayer = 'white';
var b = [];
var wpawns = [];
var bpawns = [];
var wpieces = [];
var bpieces = [];
var wtaken = [];
var btaken = [];
var danger = [];
var wking = [];
var bking = [];
var check = false;
var mate = false;

class Pos {
  constructor(row,col,piece) {
    this.row = row;
    this.col = col;
    this.piece = piece;
    this.ex = null;
  }
}

class Piece {
  constructor(color,row,col) {
    this.color = color;
    this.row = row;
    this.col = col;
    this.valid = [];
  }
  showMoves() {
    board.children[this.row].children[this.col].classList.add('active');
    for(var m of this.valid) {
      board.children[m[0]].children[m[1]].classList.add('possible');
      if(m[2]) {
        board.children[m[0]].children[m[1]].classList.add('extra-move');
        board.children[m[0]].children[m[1]].classList.add('extra-'+m[2]);
      }
    }
  }
  move(m) {
    let reVal = [];
    let repawns;
    let taken;
    if(this.color == 'white') {
      repawns = wpawns;
      taken = btaken;
    } else {
      repawns = bpawns;
      taken = wtaken;
    }
    if(b[m[0]][m[1]] !== null) {
      taken.push(b[m[0]][m[1]]);
    }
    reVal.push(new Pos(m[0],m[1],b[m[0]][m[1]]));
    reVal.push(new Pos(this.row,this.col,b[this.row][this.col]));
    b[m[0]][m[1]] = b[this.row][this.col];
    b[this.row][this.col] = null;
    this.row = m[0];
    this.col = m[1];
    for(var p of repawns) {
      p.enPass = null;
    }
    return reVal;
  }
}

class Pawn extends Piece {
  constructor(color,row,col) {
    super(color,row,col);
    this.img = 'pawn';
    this.enPass = null;
    this.dubble = true;
  }
  getMoves(check) {
    this.valid = [];
    let dir = this.color=='black' ? 1 : -1;
    let pro = this.color=='black' ? 6 : 1;
    if(this.enPass !== null) this.valid.push(this.enPass);
    if(this.col > 0) {
      if(b[this.row+dir][this.col-1] !== null && b[this.row+dir][this.col-1].color != this.color) {
        if(this.row == pro) {
          this.valid.push([this.row+dir,this.col-1,'Q']);
          this.valid.push([this.row+dir,this.col-1,'R']);
          this.valid.push([this.row+dir,this.col-1,'B']);
          this.valid.push([this.row+dir,this.col-1,'K']);
        } else {
          this.valid.push([this.row+dir,this.col-1]);
        }
      }
    }
    if(this.col < 7) {
      if(b[this.row+dir][this.col+1] !== null && b[this.row+dir][this.col+1].color != this.color) {
        if(this.row == pro) {
          this.valid.push([this.row+dir,this.col+1,'Q']);
          this.valid.push([this.row+dir,this.col+1,'R']);
          this.valid.push([this.row+dir,this.col+1,'B']);
          this.valid.push([this.row+dir,this.col+1,'K']);
        } else {
          this.valid.push([this.row+dir,this.col+1]);
        }
      }
    }
    if(b[this.row+dir][this.col] == null && !check) {
      if(this.row == pro) {
        this.valid.push([this.row+dir,this.col,'Q']);
        this.valid.push([this.row+dir,this.col,'R']);
        this.valid.push([this.row+dir,this.col,'B']);
        this.valid.push([this.row+dir,this.col,'K']);
      } else {
        this.valid.push([this.row+dir,this.col]);
      }
      if(this.dubble && b[this.row+(2*dir)][this.col] == null) {
        this.valid.push([this.row+(2*dir),this.col]);
        for(var i = this.col-1; i < this.col+2; i+=2) {
          if(i>0 && i<7 && b[this.row+(2*dir)][i] != null && b[this.row+(2*dir)][i].img == 'pawn' && b[this.row+(2*dir)][i].color != this.color) {
            b[this.row+(2*dir)][i].enPass = [this.row+dir,this.col,'e'];
          }
        }
      }
    }
    if(check) return this.valid;
  }
  move(m) {
    let reVal = super.move(m);
    console.log('in da pawn move',reVal);
    if(this.dubble) reVal[1].ex = 'd';
    this.dubble = false;
    if(m[2] == 'e') {
      if(this.color == 'white') {
        reVal.push(new Pos(m[0]+1,m[1],b[m[0]+1][m[1]]));
        btaken.push(b[m[0]+1][m[1]])
        b[m[0]+1][m[1]] = null;
      } else {
        reVal.push(new Pos(m[0]-1,m[1],b[m[0]-1][m[1]]));
        wtaken.push(b[m[0]-1][m[1]])
        b[m[0]-1][m[1]] = null;
      }
    }
    return reVal;
  }
}

class Knight extends Piece {
  constructor(color,row,col) {
    super(color,row,col);
    this.img = 'knight';
  }
  getMoves(check) {
    this.valid = [];
    for(var i = -2; i < 3; i++) {
      let l = this.col+i
      if(l > -1 && l < 8 && i !== 0) {
        for(var j = -1; j < 2; j+=2) {
          let k = this.row+(3-Math.abs(i))*j;
          if(k > -1 && k < 8) {
            if(b[k][l] == null || b[k][l].color != this.color || check) {
              this.valid.push([k,l]);
            }
          }
        }
      }
    }
    if(check) return this.valid;
  }
}

class Bishop extends Piece {
  constructor(color,row,col) {
    super(color,row,col);
    this.img = 'bishop';
  }
  getMoves(check) {
    this.valid = [];
    for(var i = -1; i < 2; i+=2) {
      for(var j = -1; j < 2; j+=2) {
        for(var m = 1; m < 8; m++) {
          let k = this.row+(m*i);
          let l = this.col+(m*j);
          if(k < 0 || k > 7 || l < 0 || l > 7) break;
          if(b[k][l] == null) {
            this.valid.push([k,l]);
          } else {
            if(b[k][l].color != this.color || check) {
              this.valid.push([k,l]);
            }
            break;
          }
        }
      }
    }
    if(check) return this.valid;
  }
}

class Rook extends Piece {
  constructor(color,row,col) {
    super(color,row,col);
    this.img = 'rook';
    this.castle = true;
  }
  getMoves(check) {
    this.valid = [];
    for(var j = -1; j < 2; j+=2) {
      for(var m = 1; m < 8; m++) {
        let k = this.row+(m*j);
        let l = this.col
        if(k < 0 || k > 7) break;
        if(b[k][l] == null) {
          this.valid.push([k,l]);
        } else {
          if(b[k][l].color != this.color || check) {
            this.valid.push([k,l]);
          }
          break;
        }
      }
    }
    for(var j = -1; j < 2; j+=2) {
      for(var m = 1; m < 8; m++) {
        let k = this.row
        let l = this.col+(m*j);
        if(l < 0 || l > 7) break;
        if(b[k][l] == null) {
          this.valid.push([k,l]);
        } else {
          if(b[k][l].color != this.color || check) {
            this.valid.push([k,l]);
          }
          break;
        }
      }
    }
    if(check) return this.valid;
  }
  move(m) {
    let reVal = super.move(m)
    if(this.castle) reVal[1].ex = 'c';
    this.castle = false;
    return reVal;
  }
}

class Queen extends Piece {
  constructor(color,row,col) {
    super(color,row,col);
    this.img = 'queen';
  }
  getMoves(check) {
    this.valid = [];
    for(var i = -1; i < 2; i++) {
      for(var j = -1; j < 2; j++) {
        for(var m = 1; m < 8; m++) {
          if(i === 0 && j === 0) break;
          let k = this.row+(m*i);
          let l = this.col+(m*j);
          if(k < 0 || k > 7 || l < 0 || l > 7) break;
          if(b[k][l] == null) {
            this.valid.push([k,l]);
          } else {
            if(b[k][l].color != this.color || check) {
              this.valid.push([k,l]);
            }
            break;
          }
        }
      }
    }
    if(check) return this.valid;
  }
}

class King extends Piece {
  constructor(color,row,col) {
    super(color,row,col);
    this.img = 'king';
    this.castle = true;
  }
  getMoves(check) {
    this.valid = [];
    for(var i = -1; i < 2; i++) {
      for(var j = -1; j < 2; j++) {
        if(!(i === 0 && j === 0)) {
          let k = this.row+i;
          let l = this.col+j;
          if(!(k < 0 || k > 7 || l < 0 || l > 7) && (b[k][l] == null || b[k][l].color != this.color || check)) {
            this.valid.push([k,l]);
          }
        }
      }
    }
    if(check) return this.valid;
  }
  move(m) {
    let reVal = super.move(m);
    if(this.castle) reVal[1].ex = 'c';
    this.castle = false;
    return reVal;
  }
}
