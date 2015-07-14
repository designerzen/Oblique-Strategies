package 
{
	import flash.display.DisplayObject;
	import flash.display.MovieClip;
	import flash.events.Event;
	import flash.events.ProgressEvent;
	import flash.utils.getDefinitionByName;
	import flash.display.BlendMode;
	[SWF(width="640", height="480", backgroundColor="0x2b2b2b", frameRate="36")]
 
	public class Preloader extends MovieClip 
	{
		
		private var progressBar:ProgressBar;
		
		public function Preloader() 
		{
			stage.scaleMode = "noScale";
            stage.align = "TL";
			addEventListener(Event.ENTER_FRAME, checkFrame);
			loaderInfo.addEventListener(ProgressEvent.PROGRESS, progress);
			// show loader
			progressBar = new ProgressBar( stage.stageHeight >> 2  );
			progressBar.blendMode = "screen";
			addChild( progressBar );
		}
		
		private function progress(e:ProgressEvent):void 
		{
			// update loader
			var percent:Number = (e.bytesLoaded) ? 0 : e.bytesLoaded / e.bytesTotal;
			progressBar.update( percent );
		}
		
		private function checkFrame(e:Event):void 
		{
			if (currentFrame == totalFrames) 
			{
				removeEventListener(Event.ENTER_FRAME, checkFrame);
				startup();
			}
		}
		
		private function startup():void 
		{
			removeChild( progressBar );
			// kill some stuff we dont need!
			progressBar = null;
			// hide loader
			stop();
			loaderInfo.removeEventListener(ProgressEvent.PROGRESS, progress);
			var mainClass:Class = getDefinitionByName("Main") as Class;
			addChild(new mainClass() as DisplayObject);
		}
		
	}
	
}

import flash.display.Sprite;
import flash.text.TextField;
import flash.text.TextFormat;

internal class ProgressBar extends Sprite
{
	private static const RADIUS:Number = 11;
	private static const MARGIN:Number = 2;
	private var progress:Number = 0;
	private var textField:TextField;
	private var barAlpha:Number = 0.5;
	
	public function get opacity():Number { return barAlpha; };
	
	public function ProgressBar( fontSize:Number = 14 ):void 
	{
		super();
		textField = createTextField( fontSize );addChild( textField );
	};
	
	// STILL LOADING...
	// Gets called every byte loaded 0-1
	public function update( percent:Number=0 ):void 
	{
		var percentage:Number = percent * 100;
		var barWidth:Number = (percent * stage.stageWidth) + RADIUS;
		var variation:Number = (100 - RADIUS)-percentage;	// -78 -> 0
		var barHeight:Number = (variation>0) ? stage.stageHeight-(2*MARGIN) : stage.stageHeight-(variation);
		var barY:Number = (variation>0) ? MARGIN : MARGIN + (variation>>14);

		if (percent < 1)
		{
			barAlpha = 0.5;
			textField.text = (Math.ceil( percentage ).toString()) + '% ';
			textField.x = -MARGIN;
			textField.y = stage.stageHeight - textField.height + MARGIN;
		}else {
			barAlpha -= 0.01;
			textField.text = (textField.length > 0) ? textField.text.substr( 0, textField.length - 1 )  : '';
		};
		
		// draw our curved preloader. straight on left side though ;)
		super.graphics.clear();
		super.graphics.beginFill( 0xffffff, barAlpha );
		super.graphics.drawRoundRect( -RADIUS, barY, barWidth, barHeight, RADIUS );
        super.graphics.endFill();
		
		progress = percent;
	};
	
	private function createTextField( fontSize:Number ):TextField
	{
		var tf:TextField = new TextField(), format:TextFormat = new TextFormat();
		format.font = "_sans";
        format.color = 0x000000;
        format.size = fontSize ;
		//trace( '@@@@@@@@@@@@@@@@@@@@@@@@@@@@ ' + format.size );
		tf.defaultTextFormat = format;
        tf.autoSize = "left";
		tf.antiAliasType = "advanced";
		tf.selectable = false;
		return tf;
	};
	
	// LOAD FAIL...Gets called if the swf is 404 or if something weird occurs
	public function fail( error:String='' ):void 
	{
		throw Error("Set the FlashVar 'file' to an appropriate swf for this to work!");
	};	
}