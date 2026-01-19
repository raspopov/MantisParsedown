<?php
/**
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

auth_reauthenticate();

access_ensure_global_level( config_get( 'manage_plugin_threshold' ) );

layout_page_header( plugin_lang_get( 'title' ) );

layout_page_begin( 'manage_overview_page.php' );

if( plugin_is_loaded('MantisCoreFormatting') &&
	config_is_set( 'plugin_MantisCoreFormatting_process_markdown' ) &&
	!config_get( 'plugin_MantisCoreFormatting_process_markdown' ) ) {
	?>
	<div class="alert alert-warning">
		<ul>
			<li><?php echo plugin_lang_get( 'markdown_warning' ); ?></li>
		</ul>
	</div>
	<?php
}

print_manage_menu( 'manage_plugin_page.php' );
?>
<div class="col-md-12 col-xs-12">
	<div class="space-10"></div>
	<div class="form-container">
		<form action="<?php echo plugin_page( 'MantisParsedownConfig_update' ) ?>" method="post">
			<?php echo form_security_field( 'plugin_MantisParsedownConfig_update' ) ?>
			<div class="widget-box widget-color-blue2">
				<div class="widget-header widget-header-small">
					<h4 class="widget-title lighter"><?php print_icon( 'fa-sliders', 'ace-icon' ) ?> <?php echo string_html_specialchars( plugin_lang_get( 'title' ) ) ?></h4>
				</div>
				<div class="widget-body">
					<div class="widget-main no-padding">
						<div class="table-responsive">
							<table class="table table-bordered table-condensed table-striped">
								<tbody>
									<tr>
										<th class="category width-40"><?php echo string_html_specialchars( plugin_lang_get( 'elements_title' ) ) ?><br/>
											<span class="small"><?php echo string_html_specialchars( plugin_lang_get( 'elements_details' ) ) ?></span>
										</th>
										<td>
											<textarea class="form-control" name="elements"><?php echo string_html_specialchars( implode( ', ', plugin_config_get( 'elements' ) ) ) ?></textarea>
										</td>
									</tr>
								</tbody>
							</table>
							<div class="widget-toolbox padding-8 clearfix">
								<input class="btn btn-primary btn-sm btn-white btn-round" value="<?php echo string_html_specialchars( lang_get( 'change_configuration' ) ) ?>" type="submit">
							</div>
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>
</div>
<?php
layout_page_end();
