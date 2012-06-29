Vectors = new Meteor.Collection("vectors");
Session.set('mode','1');

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
        _touch_time: null,
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
                    ShareBoard.textTop(this.results.length+" record ");
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
        textTop : function (text) {
             this._context.fillStyle = "white";
             this._context.font = 'italic 400 12px/2 Unknown Font, sans-serif';
             this._context.clearRect(0, 0, this._canvas.width,11);
             this._context.fillText(text, 10,10);
        },
        textButtom : function (text) {
             this._context.fillStyle = "white";
             this._context.font = 'italic 400 12px/2 Unknown Font, sans-serif';
             this._context.clearRect(0, this._canvas.height-20, this._canvas.width,this._canvas.height);
             this._context.fillText(text, 10, this._canvas.height-11);
        },
        start: function(x,y) {
            this._startX = x;
            this._startY = y;
            this._draw = true;
            this._touch_time = parseInt( new Date() /1);
        },
        end: function(x,y) {
            this._endX = x;
            this._endY = y;
            this._draw = false;
        },
        move: function(id,x,y) {
            this._endX = x;
            this._endY = y;
            this._endY = y;
            var style = 'white';
            var lineWidth = 5;
            if (Session.get('mode') == 2) {
             style = '#006600';
             lineWidth = 20;
            }

            this._touch_time = parseInt( new Date() /1);
            if (this._draw) {
                Vectors.insert({
                    user_id : id
                     , startX : this._startX
                     , startY : this._startY
                     , endX : this._endX
                     , endY : this._endY
                     , lineWidth : lineWidth
                     , strokeStyle : style
                     , created : new Date()
                });
                this._startX = this._endX;
                this._startY = this._endY;
            }
        },
        clear: function () {
            Vectors.remove({});
        },
        isLong: function() {
            var time = parseInt( new Date() /1 );
            if (( time - this._touch_time )>1000) {
                return true;
            } else {
                return false;
            }
        },
        modeChange: function () {
            if (Session.get('mode') == 1) {
                Session.set('mode','2');
            } else {
                Session.set('mode','1');
            }
        }
    }
    
    //
    // Board Event
    //   
    Template.board.events = {
        'touchstart #board, mousedown #board' : function (ev) {
            try {
                var ev = ev || window.event; //4ff
                ev.preventDefault();
                var x = (ev.changedTouches) ? ev.changedTouches[0].pageX : ev.pageX; 
                var y = (ev.changedTouches) ? ev.changedTouches[0].pageY : ev.pageY;
                ShareBoard.start(x, y);
            } catch (e){
                ShareBoard.textButtom("touch start error:" + e);
            }    
        },
        'touchmove #board, mousemove #board' : function (ev) {
            try {
                var ev = ev || window.event; //4ff
                ev.preventDefault();
                var x = (ev.changedTouches) ? ev.changedTouches[0].pageX : ev.pageX; 
                var y = (ev.changedTouches) ? ev.changedTouches[0].pageY : ev.pageY;
                ShareBoard.move(this._id, x,  y);
            } catch (e){
                ShareBoard.textButtom("touch move error:" + e);
            }    
        },
        'touchend #board, mouseup #board' : function (ev) {
            try {
                var ev = ev || window.event; //4ff
                var x = (ev.changedTouches) ? ev.changedTouches[0].pageX : ev.pageX; 
                var y = (ev.changedTouches) ? ev.changedTouches[0].pageY : ev.pageY;
                ShareBoard.end(x,  y);
                if (ShareBoard.isLong())  {
                    ShareBoard.clear();
                    ShareBoard.textButtom(" long touch clear canvas");
                }
            } catch (e){
                ShareBoard.textButtom("touch end error:" + e);
            }    
        },
        'dblTap #board, dblclick #board' : function (ev) {
            try {
                ShareBoard.modeChange();
                ShareBoard.textButtom(" mode changed");
            } catch (e){
                ShareBoard.textButtom("dbl tap error:" + e);
            }    
        }
    }
 
   //
   // Client Startup
   //   
   Meteor.startup(function () {
       ShareBoard.load("board");
   });
}
