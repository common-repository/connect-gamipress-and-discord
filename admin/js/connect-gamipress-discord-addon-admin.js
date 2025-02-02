(function( $ ) {
	'use strict';
	if (etsGamiPressParams.is_admin) {
		$(document).ready(function(){
		if(jQuery().select2) {
			$('#ets_gamipress_discord_redirect_url').select2({ width: 'resolve' });
                        $('#ets_gamipress_discord_redirect_url').on('change', function(){
				$.ajax({
					url: etsGamiPressParams.admin_ajax,
					type: "POST",
					context: this,
					data: { 'action': 'ets_gamipress_discord_update_redirect_url', 'ets_gamipress_page_id': $(this).val() , 'ets_gamipress_discord_nonce': etsGamiPressParams.ets_gamipress_discord_nonce },
					beforeSend: function () {
						$('p.redirect-url').find('b').html("");
                                                $('p.ets-discord-update-message').css('display','none');                                               
						$(this).siblings('p.description').find('span.spinner').addClass("ets-is-active").show();
					},
					success: function (data) {
						$('p.redirect-url').find('b').html(data.formated_discord_redirect_url);
						$('p.ets-discord-update-message').css('display','block');                                               
					},
					error: function (response, textStatus, errorThrown ) {
						console.log( textStatus + " :  " + response.status + " : " + errorThrown );
					},
					complete: function () {
						$(this).siblings('p.description').find('span.spinner').removeClass("ets-is-active").hide();
					}
				});

			});                        
		}
	
		/*Load all roles from discord server*/
		$.ajax({
			type: "POST",
			dataType: "JSON",
			url: etsGamiPressParams.admin_ajax,
			data: { 'action': 'ets_gamipress_discord_load_discord_roles', 'ets_gamipress_discord_nonce': etsGamiPressParams.ets_gamipress_discord_nonce },
			beforeSend: function () {
				$(".gamipress-discord-roles .spinner").addClass("is-active");
				$(".initialtab.spinner").addClass("is-active");
			},
			success: function (response) {
				if (response != null && response.hasOwnProperty('code') && response.code == 50001 && response.message == 'Missing Access') {
					$(".gamipress-btn-connect-to-bot").show();
				} else if ( response.code === 10004 && response.message == 'Unknown Guild' ) {
					$(".gamipress-btn-connect-to-bot").show().after('<p><b>The server ID is wrong or you did not connect the Bot.</b></p>');
				}else if( response.code === 0 && response.message == '401: Unauthorized' ) {
					$(".gamipress-btn-connect-to-bot").show().html("Error: Unauthorized - The Bot Token is wrong").addClass('error-bk');										
				} else if (response == null || response.message == '401: Unauthorized' || response.hasOwnProperty('code') || response == 0) {
					$("#gamipress-connect-discord-bot").show().html("Error: Please check all details are correct").addClass('error-bk');
				} else {
					if ($('.ets-tabs button[data-identity="level-mapping"]').length) {
						$('.ets-tabs button[data-identity="level-mapping"]').show();
					}
					if (response.bot_connected === 'yes') {
						$("#gamipress-connect-discord-bot").show().html("Bot Connected <i class='fab fa-discord'></i>").addClass('not-active');                                            
					}else{
						$("#gamipress-connect-discord-bot").show().html("Error: Please check the Client ID is correct").addClass('error-bk');
                                        }                                        
					

					var activeTab = localStorage.getItem('activeTab');
					if ($('.ets-tabs button[data-identity="level-mapping"]').length == 0 && activeTab == 'level-mapping') {
						$('.ets-tabs button[data-identity="settings"]').trigger('click');
					}
					$.each(response, function (key, val) {
						var isbot = false;
						if (val.hasOwnProperty('tags')) {
							if (val.tags.hasOwnProperty('bot_id')) {
								isbot = true;
							}
						}

						if (key != 'bot_connected' && key != 'previous_mapping' && isbot == false && val.name != '@everyone') {
							$('.gamipress-discord-roles').append('<div class="makeMeDraggable" style="background-color:#'+val.color.toString(16)+'" data-gamipress_role_id="' + val.id + '" >' + val.name + '</div>');
							$('#gamipress-defaultRole').append('<option value="' + val.id + '" >' + val.name + '</option>');
							makeDrag($('.makeMeDraggable'));
						}
					});
					var defaultRole = $('#selected_default_role').val();
					if (defaultRole) {
						$('#gamipress-defaultRole option[value=' + defaultRole + ']').prop('selected', true);
					}

					if (response.previous_mapping) {
						var mapjson = response.previous_mapping;
					} else {
						var mapjson = localStorage.getItem('gamipress_mappingjson');
					}

					$("#ets_gamipress_mapping_json_val").html(mapjson);
					$.each(JSON.parse(mapjson), function (key, val) {
						var arrayofkey = key.split('id_');
						var preclone = $('*[data-gamipress_role_id="' + val + '"]').clone();
						if(preclone.length>1){
							preclone.slice(1).hide();
						}
						
						if (jQuery('*[data-gamipress_rank_type_id="' + arrayofkey[1] + '"]').find('*[data-gamipress_role_id="' + val + '"]').length == 0) {
							$('*[data-gamipress_rank_type_id="' + arrayofkey[1] + '"]').append(preclone).attr('data-drop-gamipress_role_id', val).find('span').css({ 'order': '2' });
						}
						if ($('*[data-gamipress_rank_type_id="' + arrayofkey[1] + '"]').find('.makeMeDraggable').length >= 1) {
							$('*[data-gamipress_rank_type_id="' + arrayofkey[1] + '"]').droppable("destroy");
						}

						preclone.css({ 'width': '100%', 'left': '0', 'top': '0', 'margin-bottom': '0px', 'order': '1' }).attr('data-gamipress_rank_type_id', arrayofkey[1]);
						makeDrag(preclone);
					});
				}

			},
			error: function (response) {
				$("#gamipress-connect-discord-bot").show().html("Error: Please check all details are correct").addClass('error-bk');
				console.error(response);
			},
			complete: function () {
				$(".gamipress-discord-roles .spinner").removeClass("is-active").css({ "float": "right" });
				$("#skeletabsTab1 .spinner").removeClass("is-active").css({ "float": "right", "display": "none" });
			}
		});
      		/*Flush settings from local storage*/
		$("#revertMapping").on('click', function () {
			localStorage.removeItem('gamipress_mapArray');
			localStorage.removeItem('gamipress_mappingjson');
			window.location.href = window.location.href;
		});        
   
		/*Create droppable element*/
		function init() {
                    if($('.makeMeDroppable').length){
			$('.makeMeDroppable').droppable({
				drop: handleDropEvent,
				hoverClass: 'hoverActive',
			});
                    }
                    if($('.gamipress-discord-roles-col').length){
			$('.gamipress-discord-roles-col').droppable({
				drop: handlePreviousDropEvent,
				hoverClass: 'hoverActive',
			});
                    }
		}

		$(init);

		/*Create draggable element*/
		function makeDrag(el) {
			// Pass me an object, and I will make it draggable
			el.draggable({
				revert: "invalid",
				helper: 'clone',
				start: function(e, ui) {
				ui.helper.css({"width":"45%"});
				}
			});
		}

		/*Handel droppable event for saved mapping*/
		function handlePreviousDropEvent(event, ui) {
			var draggable = ui.draggable;
			if(draggable.data('gamipress_rank_type_id')){
				$(ui.draggable).remove().hide();
			}
			$(this).append(draggable);
			$('*[data-drop-gamipress_role_id="' + draggable.data('gamipress_role_id') + '"]').droppable({
				drop: handleDropEvent,
				hoverClass: 'hoverActive',
			});
			$('*[data-drop-gamipress_role_id="' + draggable.data('gamipress_role_id') + '"]').attr('data-drop-gamipress_role_id', '');

			var oldItems = JSON.parse(localStorage.getItem('gamipress_mapArray')) || [];
			$.each(oldItems, function (key, val) {
				if (val) {
					var arrayofval = val.split(',');
					if (arrayofval[0] == 'gamipress_rank_type_id_' + draggable.data('gamipress_rank_type_id') && arrayofval[1] == draggable.data('gamipress_role_id')) {
						delete oldItems[key];
					}
				}
			});
			var jsonStart = "{";
			$.each(oldItems, function (key, val) {
				if (val) {
					var arrayofval = val.split(',');
					if (arrayofval[0] != 'gamipress_rank_type_id_' + draggable.data('gamipress_rank_type_id') || arrayofval[1] != draggable.data('gamipress_role_id')) {
						jsonStart = jsonStart + '"' + arrayofval[0] + '":' + '"' + arrayofval[1] + '",';
					}
				}
			});
			localStorage.setItem('gamipress_mapArray', JSON.stringify(oldItems));
			var lastChar = jsonStart.slice(-1);
			if (lastChar == ',') {
				jsonStart = jsonStart.slice(0, -1);
			}

			var gamipress_mappingjson = jsonStart + '}';
			$("#ets_gamipress_mapping_json_val").html(gamipress_mappingjson);
			localStorage.setItem('gamipress_mappingjson', gamipress_mappingjson);
			draggable.css({ 'width': '100%', 'left': '0', 'top': '0', 'margin-bottom': '10px' });
		}

		/*Handel droppable area for current mapping*/
		function handleDropEvent(event, ui) {
			var draggable = ui.draggable;
			var newItem = [];
			var newClone = $(ui.helper).clone();
			if($(this).find(".makeMeDraggable").length >= 1){
				return false;
			}
			$('*[data-drop-gamipress_role_id="' + newClone.data('gamipress_role_id') + '"]').droppable({
				drop: handleDropEvent,
				hoverClass: 'hoverActive',
			});
			$('*[data-drop-gamipress_role_id="' + newClone.data('gamipress_role_id') + '"]').attr('data-drop-gamipress_role_id', '');
			if ($(this).data('drop-gamipress_role_id') != newClone.data('gamipress_role_id')) {
				var oldItems = JSON.parse(localStorage.getItem('gamipress_mapArray')) || [];
				$(this).attr('data-drop-gamipress_role_id', newClone.data('gamipress_role_id'));
				newClone.attr('data-gamipress_rank_type_id', $(this).data('gamipress_rank_type_id'));

				$.each(oldItems, function (key, val) {
					if (val) {
						var arrayofval = val.split(',');
						if (arrayofval[0] == 'gamipress_rank_type_id_' + $(this).data('gamipress_rank_type_id')) {
							delete oldItems[key];
						}
					}
				});

				var newkey = 'gamipress_rank_type_id_' + $(this).data('gamipress_rank_type_id');
				oldItems.push(newkey + ',' + newClone.data('gamipress_role_id'));
				var jsonStart = "{";
				$.each(oldItems, function (key, val) {
					if (val) {
						var arrayofval = val.split(',');
						if (arrayofval[0] == 'gamipress_rank_type_id_' + $(this).data('gamipress_rank_type_id') || arrayofval[1] != newClone.data('gamipress_role_id') && arrayofval[0] != 'gamipress_rank_type_id_' + $(this).data('gamipress_rank_type_id') || arrayofval[1] == newClone.data('gamipress_role_id')) {
							jsonStart = jsonStart + '"' + arrayofval[0] + '":' + '"' + arrayofval[1] + '",';
						}
					}
				});

				localStorage.setItem('gamipress_mapArray', JSON.stringify(oldItems));
				var lastChar = jsonStart.slice(-1);
				if (lastChar == ',') {
					jsonStart = jsonStart.slice(0, -1);
				}

				var gamipress_mappingjson = jsonStart + '}';
				localStorage.setItem('gamipress_mappingjson', gamipress_mappingjson);
				$("#ets_gamipress_mapping_json_val").html(gamipress_mappingjson);
			}

			$(this).append(newClone);
			$(this).find('span').css({ 'order': '2' });
			if (jQuery(this).find('.makeMeDraggable').length >= 1) {
				$(this).droppable("destroy");
			}
			makeDrag($('.makeMeDraggable'));
			newClone.css({ 'width': '100%', 'left': '0', 'top': '0', 'margin-bottom': '0px', 'position':'unset', 'order': '1' });
		} 
		/** Disconnect user button if the user is connected to single Profile page */
		$('.ets-gamipress-disconnect-discord-user').click(function (e) {
			e.preventDefault();
			$.ajax({
				url: etsGamiPressParams.admin_ajax,
				type: "POST",
				context: this,
				data: { 'action': 'ets_gamipress_discord_disconnect_user', 'ets_gamipress_discord_user_id': $(this).data('user-id') , 'ets_gamipress_discord_nonce': etsGamiPressParams.ets_gamipress_discord_nonce },
				beforeSend: function () {
					$(this).find('span').addClass("is-active").show();
				},
				success: function (data) {   
					    
					if (data.error) {
						// handle the error
						alert(data.error.msg);
					} else {
						$(this).prop('disabled', true);
						console.log(data);
					}
				},
				error: function (response, textStatus, errorThrown ) {
					console.log( textStatus + " :  " + response.status + " : " + errorThrown );
				},
				complete: function () {
					$(this).find('span').removeClass("is-active").hide();
				}
			});
		});
		/*Clear log log call-back*/
		$('#ets-gamipress-clrbtn').click(function (e) {
			e.preventDefault();
			$.ajax({
				url: etsGamiPressParams.admin_ajax,
				type: "POST",
				data: { 'action': 'ets_gamipress_discord_clear_logs', 'ets_gamipress_discord_nonce': etsGamiPressParams.ets_gamipress_discord_nonce },
				beforeSend: function () {
					$(".clr-log.spinner").addClass("is-active").show();
				},
				success: function (data) {
         
					if (data.error) {
						// handle the error
						alert(data.error.msg);
					} else {
                                            
						$('.error-log').html("Clear logs Sucesssfully !");
					}
				},
				error: function (response, textStatus, errorThrown ) {
					console.log( textStatus + " :  " + response.status + " : " + errorThrown );
				},
				complete: function () {
					$(".clr-log.spinner").removeClass("is-active").hide();
				}
			});
		}); 

		
			$('#ets_gamipress_discord_connect_button_bg_color').wpColorPicker();
			$('#ets_gamipress_discord_disconnect_button_bg_color').wpColorPicker();

			$(' .ets-gamipress-discord-review-notice > button.notice-dismiss' ).on('click', function() {

				$.ajax({
					type: "POST",
					dataType: "JSON",
					url: etsGamiPressParams.admin_ajax,
					data: { 
						'action': 'ets_gamipress_discord_notice_dismiss', 
						'ets_gamipress_discord_nonce': etsGamiPressParams.ets_gamipress_discord_nonce
					},
					beforeSend: function () {
						console.log('sending...');
					},
					success: function (response) {
						console.log(response);
					},
					error: function (response) {
						console.error(response);
					},
					complete: function () {
						// 
					}
				});
			});
		
		}); // document reday

	} // Is Admin close

		$.skeletabs.setDefaults({
			keyboard: false,
		});
})( jQuery );
