package model 
{
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import media.datatypes.TXT;	// import the TXT datatype

	public class Strategies extends EventDispatcher
	{
		public static const OBLIQUE_STRATEGIES:Array = ["data/1.txt", "data/2.txt", "data/3.txt", "data/4.txt"];
		
		public static const ON_STRATEGIES_FAILED_TO_LOAD:String = "strategiesLoaded";
		public static const ON_STRATEGIES_LOADED:String = "strategiesFailed";
		public static const ON_STRATEGIES_REQUESTED:String = "strategiesWanted";
		
		private var textData:TXT = new TXT();
	
		private var dataSet:Array = [];		
		private var dataSetShuffled:Array = [];
		private var dataSetLength:uint = 0;

		private var strategyListNumber:int;

		//
		public function get listNumber():int 
		{
			return strategyListNumber;
		};
				
		public function get nextStrategy():String 
		{
			var entry:String = dataSetShuffled.shift();
			dataSetShuffled.push( entry );
			return entry;
		};
		
		public function get previousStrategy():String 
		{
			var entry:String = dataSetShuffled.pop();
			dataSetShuffled.unshift( entry );
			return entry;
		};
		
		public function Strategies():void 
		{
			strategyListNumber = 1+ Math.random() * (OBLIQUE_STRATEGIES.length-1);
			trace("STARTUP OBLIQUE STRATEGIES VOL. "+strategyListNumber);
			load( strategyListNumber );
		};

		public function load( listNumber:int ):void 
		{
			dispatchEvent( new Event( Strategies.ON_STRATEGIES_REQUESTED ) );
			listNumber -= 1;
			if (listNumber > OBLIQUE_STRATEGIES.length-1) listNumber = OBLIQUE_STRATEGIES.length - 1;
			textData.addEventListener( TXT.ON_TXT_LOADED, onDataLoaded );
			textData.addEventListener( TXT.ON_TXT_FAILED_TO_LOAD, onDataFailedToLoad );
			textData.loadFile( OBLIQUE_STRATEGIES[ listNumber ] );
			strategyListNumber = listNumber+1;
			trace("Loading OBLIQUE STRATEGIES VOL. " + OBLIQUE_STRATEGIES[ listNumber ]);
		};
		
		// load TEXT file, and then parse it here...
		protected function onDataLoaded( event:Event ):void 
		{ 
			textData.removeEventListener( TXT.ON_TXT_LOADED, onDataLoaded );
			textData.removeEventListener( TXT.ON_TXT_FAILED_TO_LOAD, onDataFailedToLoad );
			parse( textData.content );
			dispatchEvent( new Event( Strategies.ON_STRATEGIES_LOADED ) );
		};

		protected function onDataFailedToLoad( event:Event ):void 
		{ 
			textData.removeEventListener( TXT.ON_TXT_LOADED, onDataLoaded );
			textData.removeEventListener( TXT.ON_TXT_FAILED_TO_LOAD, onDataFailedToLoad );
			dispatchEvent( new Event( Strategies.ON_STRATEGIES_FAILED_TO_LOAD ) );
		};
		
		protected function parse( data:String ):void 
		{
			dataSet = data.split("\n\n");
			dataSetLength = dataSet.length;

			var dataSetClone:Array = dataSet.map( function(e:String, ...r):String { return e } );	
			while (dataSetClone.length > 0) dataSetShuffled.push(dataSetClone.splice(Math.round(Math.random() * (dataSetClone.length - 1)), 1)[0]);
		};
		

	}
	
}