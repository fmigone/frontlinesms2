<%@ page contentType="text/html;charset=UTF-8" %>
<html>
	<head>
		<title><g:layoutTitle default="Contacts"/></title>
		<g:javascript library="jquery" plugin="jquery"/>
		<jqui:resources theme="medium" plugin="randomtextosolvebug"/>
		<script type="text/javascript">
			url_root = "${request.contextPath}/";
		</script>
		<g:layoutHead />
		<g:javascript src="application.js"/>
		<g:javascript src="mediumPopup.js"/>
		<g:javascript src="smallPopup.js"/>
		<g:javascript src="contact/checked_contact.js"></g:javascript>
		<g:javascript>
		function getGroupId(){
			var group = $('#groupId')
			return group.length ? group.val() : ''
		}
		</g:javascript>
		<g:render template="/css"/>
		<link rel="shortcut icon" href="${resource(dir:'images',file:'favicon.ico')}" type="image/x-icon" />
	</head>
	<body>
		<div id="container">
			<g:render template="/system_menu"/>
			<g:render template="/tabs"/>
			<g:render template="/flash"/>
			<div class="main">
				<g:render template="menu"/>
				<div class="content">
					<div class="content-header">
						<div  id="contact-title">
							<g:if test="${contactsSection instanceof frontlinesms2.Group}">
								<g:hiddenField name="groupId" value="&groupId=${contactsSection?.id}"/>
								<img src='${resource(dir:'images/icons',file:'groups.gif')}' />
								<img src='${resource(dir:'images/icons',file:'groups.png')}' />
								<h2>${contactsSection.name}</h2>
							</g:if>
							<g:elseif test="${!contactInstance}">
								<img src='${resource(dir:'images/icons',file:'groups.png')}' />
								<h2>New Group</h2>
							</g:elseif>
							<g:else>
								<img src='${resource(dir:'images/icons',file:'contacts.png')}' />
								<h2>${contactInstance.name?:contactInstance.primaryMobile?:'New Contact'}</h2>
							</g:else>
						</div>
					</div>
					<div class="content-body">
						<g:render template="contact_list"/>
						<g:layoutBody />
					</div>
					<input id="contact-search" type="text" onkeyup="${remoteFunction(action:'search', update:'contacts-list', params:'\'searchString=\' + this.value + getGroupId()')}" value="${params.searchString}" />
					<div class="content-footer">
							<div id="page-arrows">
								<g:if test="${contactsSection instanceof frontlinesms2.Group}">
									<g:set var="parameters" value="${[searchString:params.searchString,groupId:contactsSection.id]}" />
								</g:if>
								<g:else>
									<g:set var="parameters" value="${[searchString:params.searchString]}" />
								</g:else>
								<g:paginate next="Next" prev="Back"  action="list" total="${contactInstanceTotal}" params="${parameters}"
									max="${grailsApplication.config.grails.views.pagination.max}" />
							</div>
						</div>
				</div>
			</div>
		</div>
	</body>
</html>
