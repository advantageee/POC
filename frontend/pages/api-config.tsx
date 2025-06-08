import { useState } from 'react';

interface Config {
  apiBaseUrl: string;
  embeddingServiceUrl: string;
  enrichmentFunctionUrl: string;
}

export default function ApiConfig() {
  const [config, setConfig] = useState<Config>({
    apiBaseUrl: '',
    embeddingServiceUrl: '',
    enrichmentFunctionUrl: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert('Configuration saved (placeholder).');
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>API Configuration</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '30rem' }}>
        <label>
          API Base URL
          <input name="apiBaseUrl" value={config.apiBaseUrl} onChange={handleChange} style={{ width: '100%' }} />
        </label>
        <label>
          Embedding Service URL
          <input name="embeddingServiceUrl" value={config.embeddingServiceUrl} onChange={handleChange} style={{ width: '100%' }} />
        </label>
        <label>
          Enrichment Function URL
          <input name="enrichmentFunctionUrl" value={config.enrichmentFunctionUrl} onChange={handleChange} style={{ width: '100%' }} />
        </label>
        <button type="submit">Save</button>
      </form>
    </main>
  );
}
