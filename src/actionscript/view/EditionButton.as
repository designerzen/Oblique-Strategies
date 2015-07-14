package view 
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import gadtool.text.TextBox;
	
	import model.Strategies;
	
	import flash.filters.GlowFilter;
	
	public class EditionButton extends Sprite
	{
		
		protected var glowFilter:GlowFilter = new GlowFilter( 0xaaaaee, 0.7, 20, 20, 1, 1 );

		private static const SIZE:Number = 20;
		private static const RADIUS:Number = 3;
		
		private var label:TextBox;
		
		private var edition:int;
		
		private var strategies:Strategies;
		
		public function set version( v:int ):void 
		{
			edition = v;
			label.text = v as String;
		};
		
		public function get version( ):int 
		{
			return edition;
		};
		
		public function select():void
		{
			
			trace(version + ' selected');
			// create the shape...
			super.graphics.clear();
			super.graphics.beginFill( 0xFFFFFF );
			super.graphics.drawRoundRectComplex( 0, 0, SIZE, SIZE, RADIUS, RADIUS, RADIUS, RADIUS );
			super.graphics.endFill();
			this.alpha = 1;
			removeEventListener( MouseEvent.ROLL_OVER, onUserRollOver);
			removeEventListener( MouseEvent.ROLL_OUT, onUserRollOut);
			removeEventListener( MouseEvent.CLICK, onClick );
			this.buttonMode = false;						// Set this movieClip to react as a button
			this.useHandCursor = false;					// Show the HANDCURSOR
			this.filters = [glowFilter];
		}
		
		public function deselect():void
		{
			// create the shape...
			super.graphics.clear();
			super.graphics.beginFill( 0xFFFFFF );
			super.graphics.drawRoundRectComplex( 0, 0, SIZE, SIZE, RADIUS, 0, 0, RADIUS );
			super.graphics.endFill();
			addEventListener( MouseEvent.ROLL_OVER, onUserRollOver);
			addEventListener( MouseEvent.ROLL_OUT, onUserRollOut);
			addEventListener( MouseEvent.CLICK, onClick );
			
			this.buttonMode = true;						// Set this movieClip to react as a button
			this.mouseChildren = false;					// STOPS THE EVENTS BUBBLING TO THE OTHER MOVIE CLIPS CONTAINED IN YOUR BUTTON
			this.useHandCursor = true;					// Show the HANDCURSOR
			onUserRollOut();
			this.filters = [];
		}
		
		public function EditionButton( number:int, database:Strategies  ) 
		{
			super();
			edition = number;
			strategies = database;
			addEventListener( Event.ADDED_TO_STAGE, onAddedToStage );
		};
		
		private function onAddedToStage( event:Event ):void
		{
			removeEventListener( Event.ADDED_TO_STAGE, onAddedToStage );

			// create the textbox containing the number
			label = new TextBox( edition.toString(), 22, 0x000000, SIZE, SIZE, true, true );
			addChild(label);
			
			// create the shape...
			// if (this shape is current library)
			deselect();
			trace(version + ' deselected');
			
		};
		
		/////////////////////////////////////////////////////////////////////////////////
		// ON ROLL OVER
		/////////////////////////////////////////////////////////////////////////////////
		public function onUserRollOver(event:MouseEvent=null):void
		{
			label.colour = 0x222222;
			this.alpha = 1;
		};
		
		/////////////////////////////////////////////////////////////////////////////////
		// ON ROLL OUT
		/////////////////////////////////////////////////////////////////////////////////
		public function onUserRollOut(event:MouseEvent=null):void
		{
			label.colour = 0x000000;
			this.alpha = 0.3;
		};
			
		
		/////////////////////////////////////////////////////////////////////////////////
		// ON CLICK
		/////////////////////////////////////////////////////////////////////////////////
		public function onClick( event:MouseEvent=null ):void
		{
			strategies.load( edition );
		};
			
	}

}