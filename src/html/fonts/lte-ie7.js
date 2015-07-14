/* Load this script using conditional IE comments if you need to support IE 7 and IE 6. */

window.onload = function() {
	function addIcon(el, entity) {
		var html = el.innerHTML;
		el.innerHTML = '<span style="font-family: \'icomoon\'">' + entity + '</span>' + html;
	}
	var icons = {
			'icon-spinner' : '&#xe000;',
			'icon-spinner-2' : '&#xe001;',
			'icon-expand' : '&#xe002;',
			'icon-contract' : '&#xe003;',
			'icon-expand-2' : '&#xe004;',
			'icon-contract-2' : '&#xe005;',
			'icon-close' : '&#xe006;',
			'icon-checkmark' : '&#xe007;',
			'icon-checkmark-2' : '&#xe008;',
			'icon-arrow-up-left' : '&#xe009;',
			'icon-arrow-up' : '&#xe00a;',
			'icon-arrow-up-right' : '&#xe00b;',
			'icon-arrow-right' : '&#xe00c;',
			'icon-arrow-down-right' : '&#xe00d;',
			'icon-arrow-down' : '&#xe00e;',
			'icon-arrow-down-left' : '&#xe00f;',
			'icon-arrow-left' : '&#xe010;',
			'icon-radio-unchecked' : '&#xe011;',
			'icon-radio-checked' : '&#xe012;',
			'icon-twitter' : '&#xe013;',
			'icon-github' : '&#xe014;',
			'icon-lastfm' : '&#xe015;',
			'icon-pinterest' : '&#xe016;',
			'icon-html5' : '&#xe017;',
			'icon-html5-2' : '&#xe018;',
			'icon-chrome' : '&#xe019;',
			'icon-firefox' : '&#xe01a;',
			'icon-IE' : '&#xe01b;',
			'icon-opera' : '&#xe01c;',
			'icon-safari' : '&#xe01d;',
			'icon-deviantart' : '&#xe01e;',
			'icon-picassa' : '&#xe01f;',
			'icon-youtube' : '&#xe020;',
			'icon-facebook' : '&#xe021;',
			'icon-google-plus' : '&#xe022;',
			'icon-earth' : '&#xe023;',
			'icon-globe' : '&#xe024;',
			'icon-attachment' : '&#xe025;',
			'icon-skype' : '&#xe026;',
			'icon-linkedin' : '&#xe027;',
			'icon-stumbleupon' : '&#xe028;',
			'icon-stackoverflow' : '&#xe029;',
			'icon-blogger' : '&#xe02a;',
			'icon-wordpress' : '&#xe02b;',
			'icon-feed' : '&#xe02c;',
			'icon-feed-2' : '&#xe02d;',
			'icon-info' : '&#xe02e;',
			'icon-info-2' : '&#xe02f;',
			'icon-screen' : '&#xe030;',
			'icon-phone' : '&#xe031;',
			'icon-phone-portrait' : '&#xe032;',
			'icon-phone-landscape' : '&#xe033;',
			'icon-tablet' : '&#xe034;',
			'icon-tablet-landscape' : '&#xe035;',
			'icon-laptop' : '&#xe036;'
		},
		els = document.getElementsByTagName('*'),
		i, attr, c, el;
	for (i = 0; ; i += 1) {
		el = els[i];
		if(!el) {
			break;
		}
		attr = el.getAttribute('data-icon');
		if (attr) {
			addIcon(el, attr);
		}
		c = el.className;
		c = c.match(/icon-[^\s'"]+/);
		if (c && icons[c[0]]) {
			addIcon(el, icons[c[0]]);
		}
	}
};