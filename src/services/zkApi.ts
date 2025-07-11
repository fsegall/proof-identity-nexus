
const ZK_API_BASE_URL = 'https://zk-threshold-api.fly.dev';

export interface ZKAttestInput {
  userId: string;
  circuit: string;
  params: {
    birthDate: number;
    minAge: number;
    currentDate: number;
  };
}

export interface ZKAttestResponse {
  requestId: string;
  status: 'PROCESSING';
}

export interface ZKStatusResponse {
  requestId: string;
  status: 'PROCESSING' | 'VERIFIED' | 'FAILED';
}

export class ZKApiClient {
  private baseUrl: string;
  private bearerToken?: string;

  constructor(baseUrl: string = ZK_API_BASE_URL, bearerToken?: string) {
    this.baseUrl = baseUrl;
    this.bearerToken = bearerToken;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.bearerToken) {
      headers['Authorization'] = `Bearer ${this.bearerToken}`;
    }

    return headers;
  }

  async submitAttestation(input: ZKAttestInput): Promise<ZKAttestResponse> {
    const response = await fetch(`${this.baseUrl}/attest`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getAttestationStatus(requestId: string): Promise<ZKStatusResponse> {
    const response = await fetch(`${this.baseUrl}/status/${requestId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Attestation request not found');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async pollStatus(requestId: string, maxAttempts: number = 30, intervalMs: number = 2000): Promise<ZKStatusResponse> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const status = await this.getAttestationStatus(requestId);
      
      if (status.status === 'VERIFIED' || status.status === 'FAILED') {
        return status;
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }

    throw new Error('Polling timeout - verification taking too long');
  }

  async healthCheck(): Promise<{ status: string; uptime: number }> {
    const response = await fetch(`${this.baseUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  }
}

export const zkApiClient = new ZKApiClient();
