import { requestContext } from '@fastify/request-context'

function getRequestId(): string {
  try {
    return (requestContext as any).get('requestId') || 'unknown'
  } catch {
    return 'unknown'
  }
}

export { getRequestId }
