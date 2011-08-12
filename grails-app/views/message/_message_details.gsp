<div id="message-details">
	<g:hiddenField id="message-src" name="message-src" value="${messageInstance.src}" />
	<g:hiddenField id="message-id" name="message-id" value="${messageInstance.id}" />
	<h2 id="contact-name">${messageInstance.displayName}
		<g:if test="${!messageInstance.contactExists}">
			<g:def var="thisAddress" value="${messageInstance.src}"/>
			<g:link class="button" id="add-contact" controller="contact" action="createContact" params="[primaryMobile: thisAddress]"><img src='${resource(dir:'images/icons',file:'messagehistory.gif')}' /></g:link>
		</g:if>
	</h2>
	<p id="message-date"><g:formatDate format="dd-MMM-yyyy hh:mm" date="${messageInstance.dateCreated}" /></p>
	<p id="message-body">${messageInstance.text}</p>
	<div class='actions'>
		<ol class="buttons">
			<g:if test="${messageSection != 'trash'}">
				<li id="btn_replace">
					<div id='static'>
						<a id="btn_reply">Reply</a>
						<a id='btn_dropdown'></a>
					</div>
					<div id="dropdown_options">
						<a class='dropdown-item' id="btn_forward">Forward</a>
					</div>
				</li>
				<div id='other_btns'>
					<li class='static_btn'><g:link elementId="message-delete" action="deleteMessage" params="[messageSection: messageSection, ownerId: ownerInstance?.id, ids: messageInstance.id, archived: params.archived]">Delete</g:link></li>
					<g:if test="${!params['archived'] && messageSection != 'poll'}">
						<li class='static_btn'><g:link elementId="message-archive" action="archiveMessage" params="[messageSection: messageSection, ownerId: ownerInstance?.id, ids: messageInstance.id]">Archive</g:link></li>
					</g:if>
					<g:if test="${!params['archived'] && messageSection == 'poll'}">
						<li class='static_btn'><g:link class="activity-archive"  url="#" name="${ownerInstance.title}">Archive</g:link></li>
					</g:if>
				</div>
			</g:if>
		</ol>
		<g:if test="${!params['archived']}">
			<g:render template="/message/action_list"/>
		</g:if>
		<div id="poll-actions">
			<g:if test="${messageInstance && messageSection == 'poll'}">
				<g:render  template="categorize_response"/>
			</g:if>
		</div>
	</div>
</div>
<div class="multi-action buttons hide">
	<div id="count"></div>
	<g:if test="${messageSection != 'pending'}">
		<a id='btn_reply_all'>Reply All</a>
	</g:if>
	<g:if test="${!params['archived'] && messageSection != 'poll'}">
		<a id='btn_archive_all'>Archive All</a>
	</g:if>
	<g:if test="${!params['archived'] && messageSection == 'poll'}">
		<g:link class="activity-archive"  url="#" name="${ownerInstance.title}">Archive All</g:link>
	</g:if>
	<a id='btn_delete_all'>Delete All</a>
</div>

<div class="multi-action buttons hide">
	<div id="count"></div>
	<g:if test="${messageSection != 'pending'}">
		<a id='btn_reply_all'>Reply All</a>
	</g:if>
	<g:if test="${!params['archived'] && messageSection != 'poll'}">
		<a id='btn_archive_all'>Archive All</a>
	</g:if>
	<g:if test="${!params['archived'] && messageSection == 'poll'}">
		<g:link class="activity-archive"  url="#" name="${ownerInstance.title}">Archive All</g:link>
	</g:if>
	<a id='btn_delete_all'>Delete All</a>
</div>

<script>
	$(".activity-archive").bind("click", function() {
		var pollName = $(this).attr("name")
		alert("This message is part of activity name " + pollName + " and so cannot be archived. You must archive the activity type")
	})
</script>
