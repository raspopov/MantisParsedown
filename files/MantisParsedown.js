/*!
 * MantisParsedown - A MantisBT plugin for a native markup preview of the input fields.
 *
 * MantisParsedown is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * MantisParsedown is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MantisParsedown.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Copyright (C) 2024-2025 Nikolay Raspopov <raspopov@cherubicsoft.com>
 */

// Depends on Font Awesome

( function(script) {
	'use strict';

	var bugnote_link_tag = script.getAttribute( 'bugnote_link_tag' );
	var bug_link_tag = script.getAttribute( 'bug_link_tag' );
	var mentions_tag = script.getAttribute( 'mentions_tag' );
	var elements = script.getAttribute( 'elements' ).split( ',' );

	var buttons = [
		// In reverse order due "float" style
		[
			'fa-eye',
			'Preview',
			function() { tools( this.id, false ); }
		],
		[
			'fa-edit',
			'Edit',
			function() { tools( this.id, true ); }
		],
		// In reverse order due "float" style
		[
			'fa-comment',
			( 'Note link:\n%1note-number' ).replace( '%1', bugnote_link_tag ),
			function() { combine( this.id, bugnote_link_tag ); }
		],
		[
			'fa-list-alt',
			( 'Issue link:\n%1issue-number' ).replace( '%1', bug_link_tag ),
			function() { combine( this.id, bug_link_tag ); }
		],
		[
			'fa-user',
			( 'Mention link:\n%1username' ).replace( '%1', mentions_tag ),
			function() { combine( this.id, mentions_tag ); }
		],
		[
			'fa-table',
			'Table:\n|header|\n|-|\n|data|',
			function() { combine( this.id, '\n\n|', '|\n|-|\n|data|\n\n', false, 7, 4 ); }
		],
		[
			'fa-minus',
			'Separator:\n___',
			function() { combine( this.id, '\n___\n' ); }
		],
		[
			'fa-list-ol',
			'Ordered list:\n1. text',
			function() { combine( this.id, '\n%. ', '\n', true ); } // '%' replaced by line number
		],
		[
			'fa-list-ul',
			'Unordered list:\n- text',
			function() { combine( this.id, '\n- ', '\n', true ); }
		],
		[
			'fa-picture-o',
			'Image:\n![text](url "title")',
			function() { combine( this.id, '![', '](url)', false, 2, 3 ); }
		],
		[
			'fa-link',
			'Link:\n[text](url "title")',
			function() { combine( this.id, '[', '](url)', false, 2, 3 ); }
		],
		[
			'fa-code',
			'Code:\n`text` or ```multi-line text```',
			function() { code( this.id ); }
		],
		[
			'fa-quote-left',
			'Quote:\n> text',
			function() { combine( this.id, '\n> ', '\n\n' ); }
		],
		[
			'fa-underline',
			'Underline:\n<u>text</u>',
			function() { combine( this.id, '<u>', '</u>' ); }
		],
		[
			'fa-strikethrough',
			'Strikethrough:\n~~text~~',
			function() { combine( this.id, '~~', '~~' ); }
		],
		[
			'fa-italic',
			'Italics:\n_text_',
			function() { combine( this.id, '_', '_' ); }
		],
		[
			'fa-bold',
			'Bold:\n**text**',
			function() { combine( this.id, '**', '**' ); }
		],
		[
			'fa-header',
			'Heading:\n# h1, ## h2 ... ###### h6',
			function() { combine( this.id, '\n### ', '\n', true ); }
		]
	];

	function trimStart(str) {
		if( str && str.length && str[ 0 ] === '\n' ) {
			return str.substr( 1 );
		}
		return str;
	}

	function trimEnd(str) {
		if( str && str.length && str[ str.length - 1 ] === '\n' ) {
			return str.substr( 0, str.length - 1 );
		}
		return str;
	}

	function addClassName(element, name) {
		var i = element.className.indexOf( name );
		if( i < 0 ) {
			element.className += ' ' + name;
		}
	}

	function removeClassName(element, name) {
		var i = element.className.indexOf( name );
		if( i >= 0 ) {
			element.className = ( i ? element.className.substr( 0, i - 1 ) : '' ) +
				element.className.substr( i + name.length );
		}
	}

	function tools(id, is_edit) {
		var element = id.substr( 0, id.lastIndexOf( '_' ) );
		var textarea = document.getElementById( element );
		var view = document.getElementById( element + '_view' );
		var btn_edit = document.getElementById( element + '_1' );
		var btn_preview = document.getElementById( element + '_0' );

		// Switch edit/preview windows
		if( is_edit ) {
			addClassName( view, 'pd-hide' );
			removeClassName( textarea, 'pd-hide' );
		} else {
			if( textarea.clientHeight > 0 ) {
				view.style.minHeight = textarea.clientHeight + 'px';
			}
			addClassName( textarea, 'pd-hide' );
			removeClassName( view, 'pd-hide' );
		}

		// Switch toolbar buttons
		if( is_edit ) {
			addClassName( btn_edit, 'fa-pull-left' );
			addClassName( btn_edit, 'pd-active' );
			removeClassName( btn_preview, 'pd-active' );
		} else {
			removeClassName( btn_edit, 'pd-active' );
			addClassName( btn_preview, 'pd-active' );
		}
		for( var i = 2; i < buttons.length; i++ ) {
			var btn_tool = document.getElementById( element + '_' + i );
			if( is_edit ) {
				addClassName( btn_tool, 'fa-pull-right' );
				removeClassName( btn_tool, 'pd-hide' );
			} else {
				addClassName( btn_tool, 'pd-hide' );
			}
		}

		// Ajax preview
		if( !is_edit ) {
			view.innerHTML = '<i class="fa fa-spin fa-spinner fa-2x"></i>';
			var xhr;
			if( typeof window.XMLHttpRequest === 'function' ) {
				xhr = new XMLHttpRequest();
			} else {
				xhr = new ActiveXObject( 'Microsoft.XMLHTTP' );
			}
			xhr.onreadystatechange = function() {
				if( xhr.readyState === 4 ) {
					view.innerHTML = xhr.responseText;
				}
			}
			xhr.open( 'POST', 'api/rest/plugins/MantisParsedown', true );
			xhr.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
			xhr.setRequestHeader( 'Cache-Control', 'no-cache' );
			xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
			xhr.send( 'key=' + encodeURIComponent( element ) + '&value=' + encodeURIComponent( textarea.value ) );
		}
	}

	function code(id) {
		var textarea = document.getElementById( id.substr( 0, id.lastIndexOf( '_' ) ) );
		if( textarea.value.slice( textarea.selectionStart, textarea.selectionEnd ).indexOf( '\n' ) < 0 ) {
			// Single line code
			combine( id, '`', '`' );
		} else {
			// Multi-line code
			combine( id, '\n```\n', '\n```\n' );
		}
	}

	function combine(id, before, after, multiline, sel_start, sel_length) {
		var textarea = document.getElementById( id.substr( 0, id.lastIndexOf( '_' ) ) );
		textarea.focus();
		var start = textarea.selectionStart;
		var end = textarea.selectionEnd;
		var head = textarea.value.slice( 0, start );
		var middle = textarea.value.slice( start, end );
		var tail = textarea.value.slice( end, textarea.value.length );

		// Remove extra space separator
		if( !head ) before = trimStart( before );
		if( !tail ) after = trimEnd( after );

		var inner = '';
		if( multiline === true ) {
			var i = 1;
			var parts = middle.split( '\n' );
			for( var part in parts ) {
				if( !inner.length ) {
					// First line
					inner += before.replace( '%', i ) + parts[part];
				} else {
					// Next line
					inner += '\n' + trimStart( before ).replace( '%', i ) + parts[part];
				}
				i++;
			}
		} else {
			inner = before + middle;
		}

		var str = '';
		if( head  ) str += head;
		if( inner ) str += inner;
		if( after ) str += after;
		if( tail  ) str += tail;
		textarea.value = str;

		if( sel_start === undefined && sel_length === undefined ) {
			// Keep selection
			textarea.selectionStart = start + before.length;
			textarea.selectionEnd = textarea.selectionStart + inner.length - before.length;
		} else {
			// New selection
			textarea.selectionStart = start + inner.length + sel_start;
			textarea.selectionEnd = textarea.selectionStart + sel_length;
		}
	}

	// Install snippet
	for( var element in elements ) {
		var id = elements[element];
		var textarea = document.getElementById( id );
		id += '_';
		if( textarea && textarea.nodeName === 'TEXTAREA' ) {
			var view_id = id + 'view';
			var view = document.getElementById( view_id );
			if( !view ) {
				view = document.createElement( 'div' );
				view.id = view_id;
				view.className = 'form-control pd-view';
				textarea.insertAdjacentElement( 'afterEnd', view );
				var btns = document.createElement( 'div' );
				textarea.insertAdjacentElement( 'beforeBegin', btns );
				for( var i in buttons ) {
					var bt = document.createElement( 'button' );
					bt.setAttribute( 'type', 'button' );
					bt.id = id + i;
					bt.className = 'pd-button fa ' + buttons[i][0];
					bt.title = buttons[i][1];
					bt.onclick = buttons[i][2];
					btns.insertAdjacentElement( 'beforeEnd', bt );
				}
				tools( id, true );
			}
		}
	}
} )( document.getElementById( 'mantisparsedown_script' ) );
