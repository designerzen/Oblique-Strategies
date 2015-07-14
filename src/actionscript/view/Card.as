package view 
{
	// 3D
	import gadtool.text.Label;
	import gadtool.text.TextBox;

	import flash.display.Sprite;
	
	import org.papervision3d.materials.MovieMaterial;
	import org.papervision3d.objects.DisplayObject3D;
	import org.papervision3d.objects.primitives.Plane;
	import org.papervision3d.materials.WireframeMaterial;
	import flash.display.Sprite;
	import flash.filters.DropShadowFilter;
	import flash.filters.BitmapFilterQuality;
		import flash.filters.DropShadowFilter;
	import flash.filters.BitmapFilterQuality;
	
	public class Card extends DisplayObject3D
	{		
	
		private static const DROP_SHADOW_ANGLE:Number = 45;
		private static const DROP_SHADOW_STRENGTH:Number = 2;
		private static const DROP_SHADOW_DISTANCE:Number = 3;
		private static const DROP_SHADOW_ALPHA:Number = 0.6;
		private static const DROP_SHADOW_COLOUR:uint = 0x000000;
		private static const DROP_SHADOW_BLUR:Number = 60;
		
		public static const FACETS:Number = 6; 
		public static const CARD_WIDTH:Number = 85*6; 
		public static const CARD_HEIGHT:Number = 54*6;
		
		public static const RADIUS:Number = 20;
		public static const MARGIN:Number = 10;
		public static const MARGIN_BY_TWO:Number = MARGIN*2;
		
		public var front:Sprite;
		private var frontPlane:Plane;
		private var backPlane:Plane;
		private var plane:Plane;
		
		private var label:TextBox;
		private var sublabel:Label;
		
		private var backMaterial:MovieMaterial;
		private var frontMaterial:MovieMaterial;
		
		public var dropShadow:DropShadowFilter = new DropShadowFilter( DROP_SHADOW_DISTANCE, DROP_SHADOW_ANGLE, DROP_SHADOW_COLOUR, DROP_SHADOW_ALPHA, DROP_SHADOW_BLUR, DROP_SHADOW_BLUR, DROP_SHADOW_STRENGTH, BitmapFilterQuality.MEDIUM );
		
		public static const COPY:String = 'BRIAN ENO / PETER SCHMIDT';
		
		public function Card( startingText:String = "test" )
		{
			// FRONT
			sublabel = new Label( COPY, 10, 16,6, 0x333333, 0xffffff,-1,false );
			label = new TextBox( startingText , 22, 0x000000, CARD_WIDTH - MARGIN_BY_TWO, CARD_HEIGHT - MARGIN_BY_TWO, false, true, false, true );
			
            label.x = label.y = MARGIN;
			sublabel.y = CARD_HEIGHT-(MARGIN>>1)-sublabel.height;
			sublabel.x = CARD_WIDTH - (MARGIN >> 1) - sublabel.width;
			
			front = new Sprite();
			front.graphics.beginFill( 0xFFFFFF );
			front.graphics.drawRoundRect( 0, 0, CARD_WIDTH, CARD_HEIGHT, RADIUS, RADIUS );
			front.graphics.endFill();
		
			front.addChild( label );
			front.addChild( sublabel );

			// Create the MovieMat 
			frontMaterial = new MovieMaterial( front, true,true );
			frontMaterial.smooth = true;
			
			// BACK
			var back:Sprite = new Sprite();
			back.graphics.beginFill( 0x000000 );
			back.graphics.drawRoundRect( 0, 0, CARD_WIDTH, CARD_HEIGHT, RADIUS, RADIUS );
			back.graphics.endFill();
			
			back.graphics.beginFill( 0xffffff );
			back.graphics.drawRoundRect( MARGIN, MARGIN, CARD_WIDTH-MARGIN_BY_TWO, CARD_HEIGHT-MARGIN_BY_TWO, RADIUS, RADIUS );
			back.graphics.endFill();			
			
			back.graphics.beginFill( 0x000000 );
			back.graphics.drawRoundRect( MARGIN*2, MARGIN*2, CARD_WIDTH-MARGIN_BY_TWO*2, CARD_HEIGHT-MARGIN_BY_TWO*2, RADIUS, RADIUS );
			back.graphics.endFill();
			
			backMaterial  = new MovieMaterial( back, true, false );
			backMaterial.smooth = true;
			
			// Create the plane to show...
			frontPlane = new Plane( frontMaterial, CARD_WIDTH, CARD_HEIGHT,FACETS,FACETS );
			
			backPlane = new Plane( backMaterial, CARD_WIDTH, CARD_HEIGHT, 4,4 );
			backPlane.z = -1;
			backPlane.rotationY = 180;
			
			addChild( frontPlane );
			addChild( backPlane );
		};
		
		public function updateLabel( string:String ):void 
		{
			var author:String = '';
			label.text = string;
			//if ( string.indexOf("(") > 0 ) author = string.substring( string.indexOf("("), -1 );
			//sublabel.y = CARD_HEIGHT-MARGIN-sublabel.height;
			//sublabel.x = CARD_WIDTH - MARGIN - sublabel.width;
			sublabel.text = author;
			// recalibrate Y-coord for label to be left and vertically centred
			//label.y = 
			//frontMaterial = new MovieMaterial( front, true );
			//frontMaterial.smooth             = true;
			//frontMaterial.movie = front;
			//frontPlane.material = frontMaterial;
			//var bd = frontMaterial.createBitmapFromSprite( front );
			//frontMaterial.destroy();
			//frontMaterial.bitmap = bd;
			//frontMaterial.updateBitmap();
		};
		

	}

}

