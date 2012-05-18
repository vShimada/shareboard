if (Meteor.is_client) {

  var Draw = false;  
  
  Template.canvas.events = {

   	'mousemove canvas' : function (ev) {

		if (!ev){
			ev = event;
		}

		////console/log('canvas_mousemove'+Draw+event.pageX+":"+event.pageY);
		//todo loadの書き方がわからない
		if (this.load !== true) {
			//console/log('canvas_new');			
			this.canvas = document.getElementById("canvas");
			this.canvas.width = 800;
			this.canvas.height = 600;
			this.context = canvas.getContext('2d');
			this.rect = canvas.getBoundingClientRect();			
			this.load = true;
		}
									
		this.endX = ev.pageX - this.rect.left;
		this.endY = ev.pageY - this.rect.top;
		
		if(Draw){
			this.context.beginPath();
			this.context.moveTo(this.startX, this.startY );
			this.context.lineTo(this.endX, this.endY);
			this.context.stroke();
			this.context.save();
		}
		this.startX = this.endX;
		this.startY = this.endY; 
	  },
      'mouseup canvas' : function () {
          //console/log("canvas mouseup");
	      Draw=false;
	  },
      'mousedown canvas' : function () {
          //console/log("canvas mousedown");
		  Draw=true;
	  },
  } ;
}

if (Meteor.is_server) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
