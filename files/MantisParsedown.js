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

// Depends on jQuery and Font Awesome

if( 'undefined' == typeof jQuery ) {
	throw new Error( 'MantisParsedown requires jQuery' );
}
$( function() {
	'use strict';

	var script = $( '#mantisparsedown_script' );
	var bugnote = script.data( 'bugnote' );
	var bug = script.data( 'bug' );
	var mentions = script.data( 'mentions' );
	var elements = script.data( 'elements' ).split( ',' );

	var buttons = [
		[
			'fa-edit',
			'Edit',
			function() { tools( this.id, true ); }
		],
		[
			'fa-eye',
			'Preview',
			function() { tools( this.id, false ); }
		],
		// In reverse order due "float" style
		[
			'fa-comment',
			( 'Note link:\n%1note-number' ).replace( '%1', bugnote ),
			function() { combine( this.id, bugnote ); }
		],
		[
			'fa-list-alt',
			( 'Issue link:\n%1issue-number' ).replace( '%1', bug ),
			function() { combine( this.id, bug ); }
		],
		[
			'fa-user',
			( 'Mention link:\n%1username' ).replace( '%1', mentions ),
			function() { combine( this.id, mentions ); }
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
			'Italics (Ctrl+I):\n_text_',
			function() { italic( this.id ); }
		],
		[
			'fa-bold',
			'Bold (Ctrl+B):\n**text**',
			function() { bold( this.id ); }
		],
		[
			'fa-header',
			'Heading (Ctrl+H):\n# h1, ## h2 ... ###### h6',
			function() { head( this.id ); }
		]
	];

	function tools(id, is_edit) {
		var element = id.substr( 0, id.lastIndexOf( '_' ) );
		var textarea = $( '#' + element );
		var view = $( '#' + element + '_view' );
		var btn_edit = $( '#' + element + '_0' );
		var btn_preview = $( '#' + element + '_1' );

		// Switch edit/preview windows
		if( is_edit ) {
			view.addClass( 'pd-hide' );
			textarea.removeClass( 'pd-hide' ).focus();
		} else {
			if( textarea.height() > 0 ) {
				view.height( textarea.height() );
			}
			textarea.addClass( 'pd-hide' );
			view.removeClass( 'pd-hide' );
		}

		// Switch toolbar buttons
		if( is_edit ) {
			btn_edit.addClass( 'pd-active' );
			btn_preview.removeClass( 'pd-active' );
		} else {
			btn_edit.removeClass( 'pd-active' );
			btn_preview.addClass( 'pd-active' );
		}
		for( var i = 2; i < buttons.length; i++ ) {
			var btn_tool = $( '#' + element + '_' + i );
			if( is_edit ) {
				btn_tool.addClass( 'pd-right' ).removeClass( 'pd-hide' );
			} else {
				btn_tool.addClass( 'pd-hide' );
			}
		}

		// Ajax preview
		if( !is_edit ) {
			view.html( '<i class="fa fa-spin fa-spinner fa-2x"></i>' )
				.load( 'api/rest/plugins/MantisParsedown', { key: element, value: textarea.val() } );
		}
	}

	function code(id) {
		var textarea = $( '#' + id.substr( 0, id.lastIndexOf( '_' ) ) )[ 0 ] || $( '#' + id )[ 0 ];
		if( textarea && textarea.value.slice( textarea.selectionStart, textarea.selectionEnd ).indexOf( '\n' ) < 0 ) {
			// Single line code
			combine( id, '`', '`' );
		} else {
			// Multi-line code
			combine( id, '\n```\n', '\n```\n' );
		}
	}

	function italic(id) {
		combine( id, '_', '_' );
	}

	function bold(id) {
		combine( id, '**', '**' );
	}

	function head(id) {
		combine( id, '\n### ', '\n', true );
	}

	function combine(id, before, after, multiline, sel_start, sel_length) {
		var textarea = $( '#' + id.substr( 0, id.lastIndexOf( '_' ) ) )[ 0 ] || $( '#' + id )[ 0 ];
		if( !textarea ) return;
		textarea.focus();
		var start = textarea.selectionStart;
		var end = textarea.selectionEnd;
		var head = textarea.value.slice( 0, start );
		var middle = textarea.value.slice( start, end );
		var tail = textarea.value.slice( end, textarea.value.length );

		// Remove extra LF separator
		if( !head ) before = before.replace( /^\n{1}/, '' );
		if( !tail && after ) after = after.replace( /\n{1}$/, '' );

		var inner = '';
		if( multiline ) {
			var i = 1;
			var parts = middle.split( '\n' );
			for( var part in parts ) {
				if( !inner.length ) {
					// First line
					inner += before.replace( '%', i ) + parts[part];
				} else {
					// Next line
					inner += '\n' + before.replace( /^\n{1}/, '' ).replace( '%', i ) + parts[part];
				}
				i++;
			}
		} else {
			inner = before + middle;
		}

		var str = '';
		if( inner ) str += inner;
		if( after ) str += after;
		try {
			if ( !document.execCommand( "insertText", false, str ) ) {
				throw new Error();
			}
		} catch(e) {
			if( head  ) str = head + str;
			if( tail  ) str += tail;
			textarea.value = str;
		}

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

	function hotkeys(event) {
		if( event.ctrlKey ) {
			var c = String.fromCharCode( event.which ).toUpperCase();
			if( c == 'I' ) {
				italic( event.target.id );	// Ctrl+I
			} else if( c == 'B' ) {
				bold( event.target.id );	// Ctrl+B
			} else if( c == 'H' ) {
				head( event.target.id );	// Ctrl+H
			} else {
				return;
			}
			event.preventDefault();
		}
	}

	// Install snippet
	for( var element in elements ) {
		var id = elements[element];
		var textarea = $( 'textarea#' + id );
		if( textarea.length ) {
			var view_id = id + '_view';
			var view = $( '#' + view_id );
			if( !view.length ) {
				textarea.bind( 'keydown', hotkeys );
				view = $( '<div>', {
					'id':    view_id,
					'class': 'form-control pd-view'
					} ).insertAfter( textarea );
				var btns = $( '<div>', {
					'role': 'toolbar',
					'aria-label': 'Text Formatting',
					'aria-controls': id
					} ).insertBefore( textarea );
				id += '_';
				for( var i in buttons ) {
					btns.append( $( '<button>', {
						'type':  'button',
						'id':    id + i,
						'class': 'pd-button fa ' + buttons[i][0],
						'title': buttons[i][1],
						'value': buttons[i][1].split( '\n' )[ 0 ].replace( /:+$/, '' ),
						'click': buttons[i][2]
						} ) );
				}
				tools( id, true );
			}
		}
	}
} );
