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

( function() {
	'use strict';

	if( !window.XMLHttpRequest ) {
		return;
	}

	const elements = [
		'description',
		'steps_to_reproduce',
		'additional_info',
		'additional_information',
		'bugnote_text',
		'project-description'
	];

	const buttons = [
		[
			'fa fa-edit',
			'Edit',
			function() { edit( this.id ); }
		],
		[
			'fa fa-eye',
			'Preview',
			function() { preview( this.id ); }
		],
		// In reverse order due "float: right" style
		[
			'fa fa-minus',
			'Separator',
			function() { combine( this.id, '\n___\n' ); }
		],
		[
			'fa fa-list-ol',
			'Ordered list',
			function() { combine( this.id, '\n%. ', '\n', true ); } // '%' replaced by line number
		],
		[
			'fa fa-list-ul',
			'Unordered list',
			function() { combine( this.id, '\n- ', '\n', true ); }
		],
		[
			'fa fa-link',
			'Link',
			function() { combine( this.id, '[', '](url)', false, 2, 3 ); }
		],
		[
			'fa fa-code',
			'Code',
			function() { combine( this.id, '`', '`' ); }
		],
		[
			'fa fa-quote-left',
			'Quote',
			function() { combine( this.id, '\n> ', '\n\n' ); }
		],
		[
			'fa fa-underline',
			'Underline',
			function() { combine( this.id, '<u>', '</u>' ); }
		],
		[
			'fa fa-strikethrough',
			'Strikethrough',
			function() { combine( this.id, '~~', '~~' ); }
		],
		[
			'fa fa-italic',
			'Italics',
			function() { combine( this.id, '_', '_' ); }
		],
		[
			'fa fa-bold',
			'Bold',
			function() { combine( this.id, '**', '**' ); }
		],
		[
			'fa fa-header',
			'Heading',
			function() { combine( this.id, '\n### ', '\n', true ); }
		]
	];
	
	function tools(element, display) {
		let textarea = document.getElementById( element );
		let view = document.getElementById( element + '_view' );
		let editor = document.getElementById( element + '_0' );
		let previewer = document.getElementById( element + '_1' );
		if( display ) {
			view.classList.add( 'pd-hide' );
			textarea.classList.remove( 'pd-hide' );			
			editor.classList.add( 'pd-active' );
			previewer.classList.remove( 'pd-active' );
		} else {
			if( textarea.clientHeight > 0 ) {
				view.style.minHeight = textarea.clientHeight + 'px';
			}
			textarea.classList.add( 'pd-hide' );
			view.classList.remove( 'pd-hide' );
			editor.classList.remove( 'pd-active' );
			previewer.classList.add( 'pd-active' );
		}
		for( let i = 2; i < buttons.length; i++ ) {
			let tool = document.getElementById( element + '_' + i );
			if( display ) {
				tool.classList.add( 'pd-tool' );
				tool.classList.remove( 'pd-hide' );
			} else {
				tool.classList.add( 'pd-hide' );
			}
		}
	}

	function edit(id) {
		const element = id.substr( 0, id.lastIndexOf( '_' ) );
		tools( element, true );
	}

	function preview(id) {
		const element = id.substr( 0, id.lastIndexOf( '_' ) );
		tools( element, false );

		let textarea = document.getElementById( element );
		let view = document.getElementById( element + '_view' );
		view.innerHTML = '';
		let xhr = new XMLHttpRequest();
		xhr.onload = function() {
			if( xhr.readyState === XMLHttpRequest.DONE ) {
				view.innerHTML = xhr.responseText;
			}
		};
		xhr.onerror = function() {
			view.innerHTML = 'Connection Error';
		};
		xhr.open( 'POST', 'api/rest/plugins/MantisParsedown', true );
		xhr.setRequestHeader( 'Cache-Control', 'no-cache' );
		xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
		let data = new FormData();
		data.append( 'key', element );
		data.append( 'value', textarea.value );
		xhr.send( data );
	}

	function combine(id, before, after = '', multiline = false, sel_start, sel_length) {
		let textarea = document.getElementById( id.substr( 0, id.lastIndexOf( '_' ) ) );
		textarea.focus();
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const head = textarea.value.slice( 0, start );
		const middle = textarea.value.slice( start, end );
		const tail = textarea.value.slice( end, textarea.value.length );

		// Remove extra space separator
		if( !head ) before = before.trimStart();
		if( !tail ) after = after.trimEnd();

		let inner = '';
		if( multiline ) {
			let i = 1;
			for( const part of middle.split( '\n' ) ) {
				if( !inner.length ) {
					// First line
					inner += before.replace( '%', i ) + part;
				} else {
					// Next line
					inner += '\n' + before.trimStart().replace( '%', i ) + part;
				}
				i++;
			}
		} else {
			inner = before + middle;
		}
		textarea.value = head + inner + after + tail;

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
	for( const element of elements ) {
		const id = element + '_';
		let textarea = document.getElementById( element );
		if( textarea && textarea.nodeName === 'TEXTAREA' ) {
			let view_id = id + 'view';
			let view = document.getElementById( view_id );
			if( !view ) {
				view = textarea.insertAdjacentElement( 'afterEnd', document.createElement( 'div' ) );
				view.id = view_id;
				view.className = 'form-control pd-view';
				let btns = textarea.insertAdjacentElement( 'beforeBegin', document.createElement( 'div' ) );
				btns.className = 'pd-bar';
				for( let i = 0; i < buttons.length; i++ ) {
					let bt = btns.insertAdjacentElement( 'beforeEnd', document.createElement( 'button' ) );
					bt.id = id + i;
					bt.type = 'button';
					bt.className = buttons[i][0] + ' pd-button';
					bt.title = buttons[i][1];
					bt.onclick = buttons[i][2];
				}
				edit( id );
			}
		}
	}
} )();
