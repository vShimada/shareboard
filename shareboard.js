Vectors = new Meteor.Collection("vectors");
if (Meteor.is_client) {
    // ShareBoard //
    var ShareBoard = {
        _draw: false,
        _startX: null,
        _startY: null,
        _endX: null,
        _endY: null,
        _context:null, 
        _rect:null,
        load: function(id) {
            this._canvas = document.getElementById(id);
            this._canvas.width = this._canvas.clientWidth;
            this._canvas.height = this._canvas.clientHeight;
            this._context = this._canvas.getContext('2d');
            this._rect =  this._canvas.getBoundingClientRect(); 
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
        clear : function () {
            this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
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
        }
    }
    // Data Trigger //
    var cursor = Vectors.find({});
    var handle = cursor.observe({
        added: function (vector) { 
            ShareBoard.paint(vector);
        },
        removed: function (vector) {
            ShareBoard.clear(); 
        } 
    });
    
    // Board Event //
    Template.board.events = {
        'touchstart #board, mousedown #board' : function (ev) {
            if (!ev) ev = event; //4ff
            if ( (ev.touches) && (ev.touches.length >= 3)) Vectors.remove({});
            ShareBoard.start(ev.pageX, ev.pageY);
        },
        'touchmove #board, mousemove #board' : function (ev) {
            if (!ev) ev = event; //4ff
            ev.preventDefault();
            ShareBoard.move(this._id, ev.pageX,  ev.pageY);
        },
        'touchend #board, mouseup #board' : function (ev) {
            if (!ev) ev = event; //4ff
            ShareBoard.end(ev.pageX,  ev.pageY);
        },
        'dblclick #board' : function (ev) {
            if (!ev) ev = event; //4ff
             if (ev.shiftKey) Vectors.remove({});
        }
    } 
   //
   // Client Startup
   //   
   Meteor.startup(function () {
       ShareBoard.load("board");
   });
}
