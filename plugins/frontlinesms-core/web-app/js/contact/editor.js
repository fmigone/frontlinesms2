var contactEditor;
$(function() {
	contactEditor = new ContactEditor();
});

var ContactEditor = function() {
	var cachedFormHash,
	fieldsToAdd = [], fieldsToRemove = [],
	contactEditForm = $(".contact-edit-form"),
	contactEditWrapper = $(".contact-edit-form .edit"),
	contactId = $(".contact-edit-form [name='contactId']").val(),
	updateInProgress, updateRequested,
	updateContactData = function(event) {
		if(!contactEditForm.valid()) {
			return false;
		}
		var formData = contactEditForm.serialize(),
		formHashAtRequestTime = formData.hashCode();
		if(formHashAtRequestTime !== cachedFormHash) {
			$.ajax({
				type:"POST",
				url:url_root + "contact/saveContact",
				data:formData,
				beforeSend:function() {
					if(updateInProgress) {
						updateRequested = true;
						return false;
					}
					setUpdateInProgress(true, event.target);
					disableForm(event.target);
				},
				complete:function() {
					setUpdateInProgress(false, event.target);
					if(updateRequested) {
						updateRequested = false;
						updateContactData(event);
					}
				},
				success:function(data) {
					cachedFormHash = formHashAtRequestTime;
					if(data.success) {
						handleSuccessResponse(event, data);
					} else {
						handleFailureResponse(event, data);
					}
				}
			});
		}
	},
	handleSuccessResponse = function(event, data) {
		var contactName, mainListContactLink, mainListContactLinkKids, button, buttonKids, flagElement
			targetElement = $(event.target);

		reenableFormElements();
		contactEditWrapper.removeClass("has-server-errors");
		contactEditWrapper.removeClass("submit-in-progress");
		targetElement.removeClass("server-side-error");

		contactName = $(".contact-edit-form [name='name']").val();
		
		mainListContactLink = $('#main-list-container li a.displayName-' + contactId);
		mainListContactNumberPreview = mainListContactLink.children();
		mainListContactLink.text(contactName);
		mainListContactNumberPreview.text($("input[name=mobile]").val());
		mainListContactLink.append(mainListContactNumberPreview);

		flagElement = $('.flag');
		flagElement.removeClass().addClass(data.flagCSSClasses);

		button = $('#single-contact a.send-message');
		buttonKids = button.children();
		button.text(" " + i18n("contact.send.message", contactName));
		button.prepend(buttonKids);
	},
	handleFailureResponse = function(event, data) {
		var 
			targetElement = $(event.target), 
			localFieldName = event.target.name,
			errors = data.errors[localFieldName];

		targetElement.addClass("server-side-error");
		$.each(errors, function(index, item) {
			targetElement.parent().append("<label class='server-side-error' for='"+ localFieldName +"'>"+ item +"</label>");
		});
		contactEditWrapper.addClass("has-server-errors");
	},
	disableForm = function(targetElement) {
		targetElement = $(targetElement);
		targetElement.parent().find("label.server-side-error").remove();
		contactEditWrapper.addClass("submit-in-progress");
		contactEditWrapper.find("textarea,input[type='text']").not("#contact-search").not(targetElement).attr('disabled','disabled');
		selectmenuTools.disable("#new-field-dropdown");
		selectmenuTools.disable("#group-dropdown");
	},
	dismissInternatinalFormatWarning = function() {
		$.ajax({
			type:"GET",
			url:url_root + "contact/disableInternationalFormatWarning",
			complete: function() {
				$(".warning.l10n").fadeOut(300, function() { $(this).remove(); } );
			}
		});
		$(this).find("i").removeClass("in-progress").addClass("icon-loading");

	},
	internationalFormatWarningDisabled = function() {
		return ($("input[name=showl10warning]").val() == 'false');
	}
	reenableFormElements = function() {
		contactEditWrapper.find("textarea,input[type='text']").removeAttr("disabled");
		$("#new-field-dropdown").attr("disabled", false).selectmenu();
		$("#group-dropdown").attr("disabled", false).selectmenu();
		selectmenuTools.enable("#new-field-dropdown");
		selectmenuTools.enable("#group-dropdown");
		$("label.server-side-error").remove();
	},
	setUpdateInProgress = function(inProgress, targetElement) {
		targetElement = $(targetElement);
		updateInProgress = inProgress;
		if(updateInProgress) {
			targetElement.after("<i class='update in-progress'/>");
		} else {
			targetElement.parent().find(".update.in-progress").removeClass('in-progress').addClass('icon-ok').addClass('done').fadeOut(1000, function() { $(this).remove(); });
		}
	},
	removeCustomFieldClickHandler = function(event) {
		var fieldId, fieldElement, fieldName;
		fieldId = $(this).attr('id').substring('remove-field-'.length);
		fieldElement = $(this).parent().parent();
		fieldName = fieldElement.find('label').text();
		fieldElement.remove();
		$("#new-field-dropdown option[value='na']").after('<option value="'+fieldName+'">'+fieldName+'</option>');
		selectmenuTools.refresh($('#new-field-dropdown'));
		fieldsToAdd.remove(fieldName);
		fieldsToRemove.push(fieldName);
		updateHiddenFieldsForAddAndRemove();
		updateContactData(event);
	};

	function validateMobile(field) {
		var internationFormatWarning, val, sendMessageButton, mainListContactLink, mainListContactLinkKids;
		field = $(this);
		internationFormatWarning = $(".warning.l10n");
		val = field.val();
		if(!val || val.match(/\+\d+/) || internationalFormatWarningDisabled()) {
			field.removeClass("error");
			internationFormatWarning.hide("fast");
		} else {
			field.addClass("error");
			internationFormatWarning.show("fast");
		}


		sendMessageButton = $("#contact-infos a.send-message");
		if(val) {
			sendMessageButton.removeClass("hidden");
		} else {
			sendMessageButton.addClass("hidden");
		}
	}

//> CUSTOM FIELD STUFF START
	this.checkCustomFieldResult = function(json) {
		var name, i;
		if ($("#custom-field-name").val() !== "") {
			name = $("#custom-field-name").val();
			for(i=0; i<fieldsToAdd.length; ++i) {
				if(fieldsToAdd[i] !== "") { json.uniqueCustomFields.push(fieldsToAdd[i]); }
			}
			for(i=0; i<json.uniqueCustomFields.length; ++i) {
				if (json.uniqueCustomFields[i].toLowerCase() === name.toLowerCase()) {
					$("#smallpopup-error-panel").html(i18n("customfield.validation.error"));
					$("#smallpopup-error-panel").show();
					return false;
				}
			}
			addCustomField(name);
			$("#modalBox").remove();
		} else {
			$("#smallpopup-error-panel").html(i18n("customfield.validation.prompt"));
			$("#smallpopup-error-panel").show();
		}
	};

	function addFieldClickAction() {
		var me, fieldName;
		me = $(this).find('option:selected');
		if(me.hasClass('not-field')) { return; }
		if(me.hasClass('create-custom-field')) {
			$.ajax({
				type:'POST',
				url:url_root + 'contact/newCustomField',
				beforeSend:showThinking,
				success:function(data, textStatus) {
					hideThinking();
					launchSmallPopup(i18n("smallpopup.customfield.create.title"), data, i18n("action.ok"), clickDone);
				}
			});
		} else {
			fieldName = me.text();
			addCustomField(fieldName);
			me.remove();
		}
		selectmenuTools.snapback(this);
	}

	function clickDone() {
		if ($("#modalBox").contentWidget("onDone")) {
			$(this).find("form").submit();
		}
	}

	function addCustomField(name) {
		fieldsToRemove.remove(name);
		fieldsToAdd.push(name);
		updateHiddenFieldsForAddAndRemove();
		$("#info-add").parent().before(sanchez.template("custom-field-input", {name:name, fieldName:"newCustomField-"+name, removerName:""}));
		$(".contact-edit-form").trigger("addedCustomFieldToContact");
	}

	function updateHiddenFieldsForAddAndRemove() {
		$("input:hidden[name=fieldsToAdd]").val(fieldsToAdd.join(","));
		$("input:hidden[name=fieldsToRemove]").val(fieldsToRemove.join(","));
	}
//> CUSTOM FIELD STUFF END

//> MASS GROUP EDIT START
	function enableSaveButton() {
		var element, selecters;

		selecters = ["#update-all"];
		for(i=selecters.length-1; i>=0; --i) {
			element = $(selecters[i]);
			element.removeAttr("disabled");
			element.removeClass("disabled");
			if(element.hasClass("fsms-button-replaced")) {
				element.next().removeClass("disabled");
			}
		}
	}

//> INITIALISE
	function init() {
		cachedFormHash = contactEditForm.serialize().hashCode();
		$("#notes").autosize();

		$("input[name=mobile]").change(validateMobile);

		// bind form data change listeners
		$(".edit input[type=text], .edit textarea").blur(updateContactData);
		$(".edit input[type=hidden], .edit select:not(#group-dropdown)").change(updateContactData);

		contactEditForm.bind("addedCustomFieldToContact", function() {
			$(".edit input[type=text]").blur(updateContactData);
			$(".edit .custom-field .remove-command").click(removeCustomFieldClickHandler);
		});
		$(".edit .custom-field .remove-command").click(removeCustomFieldClickHandler);

		$("#new-field-dropdown").change(addFieldClickAction);

		$("#multi-group-list .remove-group").click(enableSaveButton);
		$("#multi-group-dropdown").change(enableSaveButton);
		$("#dismissl10nWarning").click(dismissInternatinalFormatWarning);
	}

	this.updateContactData = updateContactData;
	this.init = init;
	init();
};

