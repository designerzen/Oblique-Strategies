package view 
{
	import flash.display.Sprite;
	import flash.events.Event;
	import gadtool.text.Label;
	import view.EditionButton;
	
	import model.Strategies;
	
	import flash.events.MouseEvent;
	
	public class EditionFacade extends Sprite
	{
		public static const MARGIN:Number = 4;
		private static const GAP:Number = 1;
		// there are 4 versions!
		private var edition1:EditionButton;
		private var edition2:EditionButton;
		private var edition3:EditionButton;
		private var edition4:EditionButton;
		//public var edition5:EditionButton = new EditionButton("5");
		
		private var strategies:Strategies;
		
		private var editions:Array;
		private var label:Label;
		
		public function EditionFacade( database:Strategies ) 
		{
			super();
			strategies = database;
			addEventListener( Event.ADDED_TO_STAGE, onAddedToStage );
		};
		
		private function onAddedToStage( event:Event ):void
		{
			removeEventListener( Event.ADDED_TO_STAGE, onAddedToStage );
			
			edition1 = new EditionButton( 1,strategies );
			edition2 = new EditionButton( 2,strategies );
			edition3 = new EditionButton( 3,strategies );
			edition4 = new EditionButton( 4,strategies );
			
			editions = [ edition1, edition2, edition3, edition4 ];
		
			editions[0].x = MARGIN;
			addChild( editions[0] );
			
			var i:int = 1;
			for ( i; i < editions.length; ++i )
			{
				editions[i].x = editions[i - 1].x + editions[i - 1].width + GAP;
				addChild( editions[i] );
			}
			
			label = new Label( "LOADING PLEASE WAIT...", 14, 2, 2, 0x000000, 0x222222, -1, true);
			label.x = editions[i-1].x + editions[i-1].width + GAP;
			label.y = 0;
			addChild( label );
			update( );
			strategies.addEventListener( Strategies.ON_STRATEGIES_LOADED, onDataLoaded );
			strategies.addEventListener( Strategies.ON_STRATEGIES_REQUESTED, onDataLoading );
		};	
		///////////////////////////////////////////////////////////////////////////////////////////
		// Strategies loaded
		///////////////////////////////////////////////////////////////////////////////////////////
		protected function onDataLoading( event:Event ):void 
		{ 
			label.text = "LOADING..."
			label.setTextColour( 0x442222 );
		};
		
		///////////////////////////////////////////////////////////////////////////////////////////
		// Strategies loaded
		///////////////////////////////////////////////////////////////////////////////////////////
		protected function onDataLoaded( event:Event ):void 
		{ 
			update( );
		};
		
		public function update( ):void 
		{
			
			for ( var i:int = 0; i < editions.length; ++i )
			{
				trace( i+'.'+strategies.listNumber );
				if ( i == strategies.listNumber - 1)
				{
					editions[ i ].select();
					label.setTextColour( 0x000000 );
					label.text = "OBLIQUE STRATEGIES COLLECTION " + (i + 1);
				}else {
					editions[ i ].deselect();
				}
			}
			
		}
		
	}

}