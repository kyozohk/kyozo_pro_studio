
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete' | 'write';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  public readonly serverError?: Error;

  constructor(context: SecurityRuleContext, serverError?: Error) {
    const jsonContext = JSON.stringify(context, null, 2);
    const message = `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${jsonContext}`;
    
    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;
    this.serverError = serverError;

    // This is to make the error visible in the Next.js dev overlay
    this.stack = serverError?.stack || new Error(message).stack;
  }
}
