package frontlinesms2

class AutoreplyController extends ActivityController {
	def autoreplyService

	def save() {
		// FIXME this should use withAutoreply to shorten and DRY the code, but it causes cascade errors as referenced here:
		// http://grails.1312388.n4.nabble.com/Cascade-problem-with-hasOne-relationship-td4495102.html
		def autoreply = Autoreply.get(params.ownerId)?: new Autoreply()
		doSave(autoreplyService, autoreply)
	}

	def sendReply() {
		def autoreply = Autoreply.get(params.ownerId)
		def incomingMessage = TextMessage.get(params.messageId)
		params.addresses = incomingMessage.src
		params.messageText = autoreply.autoreplyText
		def outgoingMessage = messageSendService.createOutgoingMessage(params)
		autoreply.addToMessages(outgoingMessage)
		messageSendService.send(outgoingMessage)
		autoreply.save()
		render ''
	}
}

