Vectors = new Meteor.Collection("vectors");
//Vectors.remove({});
if (Meteor.is_client) {
    //
    // Board
    //
    var Board = {
        draw: false,
        startX: null,
        startY: null,
        endX: null,
        endY: null,
        context:null, 
        rect:null,
        load: function(id) {
            this.canvas = document.getElementById(id);
            this.canvas.width = 320;
            this.canvas.height = 480;
            this.context = canvas.getContext('2d');
            this.rect =  canvas.getBoundingClientRect(); 
        },
        paint : function (vector) {
            this.context.lineWidth = 5;
            this.context.strokeStyle = 'white';
            this.context.beginPath();
            this.context.moveTo(vector.startX - this.rect.left, vector.startY-this.rect.top);
            this.context.lineTo(vector.endX - this.rect.left, vector.endY-this.rect.top);
            this.context.stroke();
            this.context.save();
        },
        clear : function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        },
        start: function(x,y) {
            this.startX = x;
            this.startY = y;
            this.draw = true;
        },
        end: function(x,y) {
            this.endX = x;
            this.endY = y;
            this.draw = false;
        },
        save: function(id,x,y) {
            this.endX = x;
            this.endY = y;
            if (this.draw) {
                Vectors.insert({
                    user_id : id
                     , startX : this.startX
                     , startY : this.startY
                     , endX : this.endX
                     , endY : this.endY
                     , created : new Date()
                });
                this.startX = this.endX;
                this.startY = this.endY;
            }
        }
    }
    //
    // dara trigger
    //
    var cursor = Vectors.find({});
    var handle = cursor.observe({
        added: function (vector) { 
            Board.paint(vector);
        },
        removed: function (vector) {
            Board.clear(); 
        } 
    });
    //
    // canvas event
    //
    Template.draw.events = {
        'mousedown canvas' : function (ev) {
            if (!ev) ev = event;
            Board.start(ev.pageX, ev.pageY);
        },
        'dblclick canvas' : function (ev) {
            Vectors.remove({});
        },
        'mousemove canvas' : function (ev) {
            if (!ev) ev = event;
            ev.preventDefault();
            Board.save(this._id, ev.pageX,  ev.pageY);
        },
        'mouseup canvas' : function (ev) {
            if (!ev) ev = event;
            Board.end(ev.pageX,  ev.pageY);
        },
        'touchstart canvas' : function (ev) {
            if (!ev) ev = event;
            //three point clear
            if ( (ev.touches) && (ev.touches.length > 1)) Vectors.remove({});
            Board.start(ev.pageX, ev.pageY);
        },
        'touchmove canvas' : function (ev) {
            if (!ev) ev = event;
            ev.preventDefault();
            Board.save(this._id, ev.pageX,  ev.pageY);
        },
        'touchend canvas' : function (ev) {
            if (!ev) ev = event;
            Board.end(ev.pageX,  ev.pageY);
        }
   } 
   Meteor.startup(function () {
       Board.load("canvas");
   });
}
