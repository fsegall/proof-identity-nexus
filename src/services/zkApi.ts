
const ZK_API_BASE_URL = 'https://zk-threshold-api.fly.dev';

export interface ZKGenerateProofInput {
  circuitName: string;
  input: {
    birthDate: number;
    minAge: number;
    currentDate: number;
  };
}

export interface ZKGenerateProofResponse {
  proof: object;
  publicSignals: string[];
}

export interface ZKVerifyInput {
  circuit: string;
  proof: object;
  publicSignals: string[];
}

export interface ZKVerifyResponse {
  valid: boolean;
  isOldEnough: boolean;
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

  async generateProof(input: ZKGenerateProofInput): Promise<ZKGenerateProofResponse> {
    const response = await fetch(`${this.baseUrl}/generate-proof`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async verifyProof(input: ZKVerifyInput): Promise<ZKVerifyResponse> {
    const response = await fetch(`${this.baseUrl}/verify`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async verifyAge(birthDate: number, minAge: number = 18): Promise<ZKVerifyResponse> {
    const currentDate = Math.floor(Date.now() / 1000);
    
    // Primeiro, gerar a prova
    const proofInput: ZKGenerateProofInput = {
      circuitName: 'ageVerifier',
      input: {
        birthDate,
        minAge,
        currentDate
      }
    };

    const proofResponse = await this.generateProof(proofInput);

    // Depois, verificar a prova
    const verifyInput: ZKVerifyInput = {
      circuit: 'ageVerifier',
      proof: proofResponse.proof,
      publicSignals: proofResponse.publicSignals
    };

    return this.verifyProof(verifyInput);
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
