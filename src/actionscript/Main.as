package 
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.MouseEvent;
	
	import view.EditionFacade;
	import view.Card;
	
	import model.Strategies;
	
	import tween.equations.*;
	
	import media.datatypes.TXT;	// import the TXT datatype
	
	import org.papervision3d.materials.BitmapMaterial;
	import org.papervision3d.materials.MovieMaterial;
	import org.papervision3d.materials.ColorMaterial;
	import org.papervision3d.materials.utils.MaterialsList;
	import org.papervision3d.objects.primitives.Cube;
	import org.papervision3d.objects.primitives.Plane;
	import org.papervision3d.view.BasicView;


	public class Main extends BasicView
	{
		public static const DEFAULT_DURATION:Number = 20;
		public static const MODES:Array = ["rotationY","rotationX"];
		
		private var rotationMode:String = MODES[0];
		private var card:Card;
		private var strategies:Strategies;
		private var counter:uint = 0;
		private var duration:Number = DEFAULT_DURATION;
		private var isEasing:Boolean = false;
		private var easeLeft:Boolean = false;
		private var easeDown:Boolean = false;
		private var hasLabelChanged:Boolean = false;
		
		
		private var libraryFacade:EditionFacade;
		
		
		///////////////////////////////////////////////////////////////////////////////////////////
		// Go!
		///////////////////////////////////////////////////////////////////////////////////////////
		public function Main( startingText:String = "test", viewportWidth:Number = 800, viewportHeight:Number = 600, scaleToStage:Boolean=true, interactive:Boolean=false, cameraType:String="CAMERA3D"):void 
		{
			super( viewportWidth, viewportHeight, scaleToStage, interactive, cameraType ); 
			
			if (stage) init();
			else addEventListener(Event.ADDED_TO_STAGE, init);
		};
		
		///////////////////////////////////////////////////////////////////////////////////////////
		//
		///////////////////////////////////////////////////////////////////////////////////////////
		private function init(e:Event = null):void 
		{
			removeEventListener(Event.ADDED_TO_STAGE, init);
			// create a strategy list
			strategies = new Strategies();
			strategies.addEventListener( Strategies.ON_STRATEGIES_LOADED, onDataLoaded );
			strategies.addEventListener( Strategies.ON_STRATEGIES_FAILED_TO_LOAD, onDataFailedToLoad );
			
			stage.addEventListener( Event.RESIZE, onStageResized );
		};
			
		///////////////////////////////////////////////////////////////////////////////////////////
		// Strategies loaded
		///////////////////////////////////////////////////////////////////////////////////////////
		protected function onDataLoaded( event:Event ):void 
		{ 
			//strategies.removeEventListener( Strategies.ON_STRATEGIES_LOADED, onDataLoaded );
			//strategies.removeEventListener( Strategies.ON_STRATEGIES_FAILED_TO_LOAD, onDataFailedToLoad );
			trace("STRATEGIES UPDATED ");
			if ( enable() ) spin();
		};
		
		///////////////////////////////////////////////////////////////////////////////////////////
		// Strategies failed
		///////////////////////////////////////////////////////////////////////////////////////////
		protected function onDataFailedToLoad( event:Event ):void 
		{ 
			strategies.removeEventListener( Strategies.ON_STRATEGIES_LOADED, onDataLoaded );
			strategies.removeEventListener( Strategies.ON_STRATEGIES_FAILED_TO_LOAD, onDataFailedToLoad );
			disable();
		};
		///////////////////////////////////////////////////////////////////////////////////////////
		// Strategies failed
		///////////////////////////////////////////////////////////////////////////////////////////
		protected function onStageResized( event:Event=null ):void 
		{ 
			if (libraryFacade) libraryFacade.y = stage.stageHeight - 25;
		};
		
		///////////////////////////////////////////////////////////////////////////////////////////
		// ENABLE Interface
		///////////////////////////////////////////////////////////////////////////////////////////
		public function enable():Boolean 
		{
			if (card) return true;
			// load graphics
			card = new Card( strategies.nextStrategy );
			this.filters = [ card.dropShadow ];
			
			libraryFacade = new EditionFacade( strategies );
			
			// update coords
			super.scene.addChild( card );
			
			//super.camera.z = 1;
			super.camera.z = -500;
			super.camera.lookAt( card );
			super.camera.useCulling = true;
			//super.camera.distanceTo( card );
			
			renderer.renderScene(scene, camera, viewport);
			stage.addEventListener( MouseEvent.CLICK, onUserClicked );

			var logoZen:Logo_Code = new Logo_Code();
			logoZen.setDestination( "http://www.designerzen.com/" );
			logoZen.bindToCorner( "tl", EditionFacade.MARGIN, EditionFacade.MARGIN );
			logoZen.alpha = 0.5;
			
			onStageResized();
			
			addChild(libraryFacade) ;
			addChild(logoZen) ;
			return false;
		};
		
		///////////////////////////////////////////////////////////////////////////////////////////
		// DISABLE Interface
		///////////////////////////////////////////////////////////////////////////////////////////
		public function disable():void 
		{
			stage.removeEventListener( MouseEvent.CLICK, onUserClicked );
			card = null;
		};
		
		///////////////////////////////////////////////////////////////////////////////////////////
		// EVENT :
		//	User has clicked. Figure out which side has been clicked!
		///////////////////////////////////////////////////////////////////////////////////////////
		protected function onUserClicked( event:Event=null ):void 
		{
			// check to see if it a user click on the facade!
			if ( libraryFacade.hitTestPoint( this.mouseX, this.mouseY) ) return;
			spin();
		};
		
		public function spin():void
		{
			if (isEasing) return;
			counter = 0;
			hasLabelChanged = false;
			isEasing = true;
			
			var centerMouseX:Number = this.mouseX-(stage.stageWidth >> 1);
			var centerMouseY:Number = this.mouseY-(stage.stageHeight >> 1);

			var hypotenuse:Number = Math.sqrt( (centerMouseX *centerMouseX) + (centerMouseY * centerMouseY) );
			
			var cos:Number = centerMouseX / hypotenuse;
			var rad:Number = Math.acos(cos);						// rads = degrees * ( Math.PI / 180 )
			var degrees:Number = Math.floor(180/(Math.PI / rad));
			
			
			// only rotate in 90 degree arc
			if ( ( degrees > 45) && (degrees < 135) )
			{
				// Up / Down
				if ( centerMouseY < 0 ) easeLeft = false;
				else easeLeft = true;
				rotationMode = MODES[1];
			}else{
				// Left / Right
				if ( centerMouseX < 0 ) easeLeft = false;
				else easeLeft = true;			
				rotationMode = MODES[0];
			}
			
			var speedAdjustment:Number = ( (stage.stageWidth >>1)/ hypotenuse  );
			duration = (DEFAULT_DURATION * speedAdjustment) >> 0 ;
			if (duration > 70) duration = 70;
			trace('speedAdjustment='+speedAdjustment+' duration='+duration);
			//trace(hypotenuse+'=hypotenuse ' +degrees+'=deg '+rad+'=rad');
			super.startRendering();
		};

		///////////////////////////////////////////////////////////////////////////////////////////
		// ON EVERY FRAME
		///////////////////////////////////////////////////////////////////////////////////////////
        protected override function onRenderTick(event:Event = null):void
        {
			var rot:Number =  CircOut.circOut( counter++, 0, 360, duration );

			if (easeLeft) card[ rotationMode ] = -rot;
			else card[ rotationMode ] = rot;
			
			super.onRenderTick(event);

			//var centerX:int = stage.stageWidth >> 1;
			//var centerY:int = stage.stageHeight >> 1;
			
			//var rotY: Number = (mouseY-centerY)/centerY*(stage.stageWidth*2);
			//var rotX: Number = (centerX-mouseX)/centerX*(stage.stageHeight*2);
			//camera.x += (rotX - camera.x) / 500;
			//camera.y += (rotY - camera.y) / 500;

			// RETURN ease check
			if (counter == duration)
			{
				isEasing = false;
				super.stopRendering();
				return;
			}	
			
			// Update Label
			var cardRotation:int = rot >>0;
			if ((cardRotation > 180)&&(!hasLabelChanged))
			{
				card.updateLabel( strategies.nextStrategy );
				hasLabelChanged = true;
			}
			// End Loop
		};
		
	}
	
}