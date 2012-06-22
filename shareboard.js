Vectors = new Meteor.Collection("vectors");
if (Meteor.is_client) {
    //
    // ShareBoard
    //   
    var ShareBoard = {
        _draw: false,
        _startX: null,
        _startY: null,
        _endX: null,
        _endY: null,
        _context:null, 
        _rect:null,
        _handle:null,
        load: function(id) {
            this._canvas = document.getElementById(id);
            this._canvas.width = this._canvas.clientWidth;
            this._canvas.height = this._canvas.clientHeight;
            this._context = this._canvas.getContext('2d');
            this._rect =  this._canvas.getBoundingClientRect(); 
            // Data Trigger //
            this._handle = Vectors.find({}).observe({
                added: function (vector) { 
                    ShareBoard.paint(vector);
                    ShareBoard.text(this.results.length);
                },
                removed: function (vector) {
                    ShareBoard.unpaint(); 
                } 
            });
        },
        paint : function (vector) {
            this._context.lineWidth = vector.lineWidth;
            this._context.strokeStyle = vector.strokeStyle;
            this._context.beginPath();
            this._context.moveTo(vector.startX - this._rect.left, vector.startY-this._rect.top);
            this._context.lineTo(vector.endX - this._rect.left, vector.endY-this._rect.top);
            this._context.stroke();
            this._context.save();
        },
        unpaint : function () {
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        },
        text : function (text) {
             this._context.fillStyle = "white";
             this._context.font = 'italic 400 12px/2 Unknown Font, sans-serif';
             this._context.clearRect(0, 0, this._canvas.width,11);
             this._context.fillText(text, 10,10);
        },
        start: function(x,y) {
            this._startX = x;
            this._startY = y;
            this._draw = true;
        },
        end: function(x,y) {
            this._endX = x;
            this._endY = y;
            this._draw = false;
        },
        move: function(id,x,y) {
            this._endX = x;
            this._endY = y;
            if (this._draw) {
                Vectors.insert({
                    user_id : id
                     , startX : this._startX
                     , startY : this._startY
                     , endX : this._endX
                     , endY : this._endY
                     , lineWidth : 5
                     , strokeStyle :'white'
                     , created : new Date()
                });
                this._startX = this._endX;
                this._startY = this._endY;
            }
        },
        clear: function () {
            Vectors.remove({});
        }
    }
    
    //
    // Board Event
    //   
    Template.board.events = {
        'touchstart #board, mousedown #board' : function (ev) {
            var ev = ev || window.event; //4ff
            var x = (ev.touches) ? ev.touches[0].pageX : ev.pageX; 
            var y = (ev.touches) ? ev.touches[0].pageY : ev.pageY;
            if ( (ev.touches) && (ev.touches.length >= 3)) ShareBoard.clear();
            ShareBoard.start(x, y);
        },
        'touchmove #board, mousemove #board' : function (ev) {
            var ev = ev || window.event; //4ff
            var x = (ev.touches) ? ev.touches[0].pageX : ev.pageX; 
            var y = (ev.touches) ? ev.touches[0].pageY : ev.pageY;
            ev.preventDefault();
            ShareBoard.move(this._id, x,  y);
        },
        'touchend #board, mouseup #board' : function (ev) {
            var ev = ev || window.event; //4ff
            var x = (ev.touches) ? ev.touches[0].pageX : ev.pageX; 
            var y = (ev.touches) ? ev.touches[0].pageY : ev.pageY;
            ShareBoard.end(x,  y);
        },
        'dblclick #board' : function (ev) {
            var ev = ev || window.event; //4ff
             if (ev.shiftKey) ShareBoard.clear();
        }
    } 
   //
   // Client Startup
   //   
   Meteor.startup(function () {
       ShareBoard.load("board");
   });
}
