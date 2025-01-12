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
			'Editor',
			function() { edit( this.id ); }
		],
		[
			'fa fa-eye',
			'Preview',
			function() { preview( this.id ); }
		],
		// In reverse order due "float: right" style
		[
			'tool fa fa-minus',
			'Separator',
			function() { combine( this.id, '\n___\n' ); }
		],
		[
			'tool fa fa-list-ul',
			'Unordered list',
			function() { combine( this.id, '- ', '\n', '\n' ); }
		],
		[
			'tool fa fa-link',
			'Link',
			function() { combine( this.id, '[', '](url)', undefined, 2, 3 ); }
		],
		[
			'tool fa fa-code',
			'Code',
			function() { combine( this.id, '`', '`' ); }
		],
		[
			'tool fa fa-quote-left',
			'Quote',
			function() { combine( this.id, '\n> ', '\n\n' ); }
		],
		[
			'tool fa fa-underline',
			'Underline',
			function() { combine( this.id, '<u>', '</u>' ); }
		],
		[
			'tool fa fa-strikethrough',
			'Strikethrough',
			function() { combine( this.id, '~~', '~~' ); }
		],
		[
			'tool fa fa-italic',
			'Italics',
			function() { combine( this.id, '_', '_' ); }
		],
		[
			'tool fa fa-bold',
			'Bold',
			function() { combine( this.id, '**', '**' ); }
		],
		[
			'tool fa fa-header',
			'Heading',
			function() { combine( this.id, '\n### ', '\n', '\n' ); }
		]
	];
	
	function tools(element, display) {
		for( let i = 2; i < buttons.length; i++ ) {
			document.getElementById( element + '_' + i ).style.display = display;
		}
	}

	function edit(id) {
		const element = id.substr( 0, id.lastIndexOf( '_' ) );
		document.getElementById( element + '_view' ).style.display = 'none';
		document.getElementById( element + '_0' ).classList.add( 'active' );
		document.getElementById( element + '_1' ).classList.remove( 'active' );
		tools( element, 'block' );
		document.getElementById( element ).style.display = 'block';
	}

	function preview(id) {
		const element = id.substr( 0, id.lastIndexOf( '_' ) );
		document.getElementById( element + '_0' ).classList.remove( 'active' );
		document.getElementById( element + '_1' ).classList.add( 'active' );
		tools( element, 'none' );

		let textarea = document.getElementById( element );
		let view = document.getElementById( element + '_view' );
		view.innerHTML = '';
		if( textarea.style.display !== 'none' ) {
			view.style.minHeight = textarea.clientHeight + 'px';
			textarea.style.display = 'none';
			view.style.display = 'block';
		}

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

	function combine(id, before, after = '', split, sel_start, sel_length) {
		let textarea = document.getElementById( id.substr( 0, id.lastIndexOf( '_' ) ) );
		textarea.focus();
		const start = textarea.selectionStart;
		const end = textarea.selectionEnd;
		const head = textarea.value.slice( 0, start );
		const middle = textarea.value.slice( start, end ).split( split );
		const tail = textarea.value.slice( end, textarea.value.length );

		// Remove extra space separator
		if( !head ) before = before.trimStart();
		if( !tail ) after = after.trimEnd();

		let inner = '';
		for( const part of middle ) {
			if( inner.length ) inner += split;
			inner += before + part + after;
		}
		textarea.value = head + inner + tail;

		if( sel_start === undefined && sel_length === undefined ) {
			// Keep selection
			textarea.selectionStart = start + before.length;
			textarea.selectionEnd = textarea.selectionStart + inner.length - before.length - after.length;
		} else {
			// New selection
			textarea.selectionStart = start + inner.length - after.length + sel_start;
			textarea.selectionEnd = textarea.selectionStart + sel_length;
		}
	}

	// Install snippet for next elements:
	for( const element of elements ) {
		const id = element + '_';
		let textarea = document.getElementById( element );
		if( textarea && textarea.nodeName === 'TEXTAREA' ) {
			let view_id = id + 'view';
			let view = document.getElementById( view_id );
			if( !view ) {
				view = textarea.insertAdjacentElement( 'afterEnd', document.createElement( 'div' ) );
				view.id = view_id;
				view.className = 'form-control parsedown-view';
				let btns = textarea.insertAdjacentElement( 'beforeBegin', document.createElement( 'div' ) );
				btns.className = 'parsedown-bar';
				for( let i = 0; i < buttons.length; i++ ) {
					let bt = btns.insertAdjacentElement( 'beforeEnd', document.createElement( 'button' ) );
					bt.id = id + i;
					bt.type = 'button';
					bt.className = 'parsedown-button ' + buttons[i][0];
					bt.title = buttons[i][1];
					bt.onclick = buttons[i][2];
				}
				edit( id );
			}
		}
	}
} )();
