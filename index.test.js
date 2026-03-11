jest.mock('@actions/core', () => ({
  getInput: jest.fn((name) => (name === 'vercel-token' ? 'fake-token' : '')),
  exportVariable: jest.fn(),
  setOutput: jest.fn(),
  setFailed: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}))

jest.mock('@actions/exec', () => ({ exec: jest.fn() }))
jest.mock('@actions/github', () => ({
  context: { action: '', ref: 'refs/heads/main', eventName: 'push', actor: '', sha: '', workflow: '', repo: { owner: '', repo: '' }, issue: {} },
  GitHub: jest.fn(),
}))
jest.mock('node:child_process', () => ({ execSync: jest.fn(() => 'commit message') }))

const { parseInspectOutput } = require('./index')

describe('parseInspectOutput', () => {
  const SAMPLE_OUTPUT = `
Vercel CLI 32.0.0
> Fetching deployment "https://my-project-abc123.vercel.app" in my-team
  id              dpl_abc123XYZ
  name            my-project
  url             my-project-abc123.vercel.app
  created         1h ago
`

  describe('deployment-id', () => {
    it('parses deployment id from inspect output', () => {
      const { id } = parseInspectOutput(SAMPLE_OUTPUT)
      expect(id).toBe('dpl_abc123XYZ')
    })

    it('returns null when id is absent', () => {
      const { id } = parseInspectOutput('  name            my-project\n')
      expect(id).toBeNull()
    })

    it('returns null for empty output', () => {
      const { id } = parseInspectOutput('')
      expect(id).toBeNull()
    })
  })

  describe('preview-name', () => {
    it('parses name from inspect output', () => {
      const { name } = parseInspectOutput(SAMPLE_OUTPUT)
      expect(name).toBe('my-project')
    })

    it('returns null when name is absent', () => {
      const { name } = parseInspectOutput('  id              dpl_abc123XYZ\n')
      expect(name).toBeNull()
    })
  })

  it('returns both name and id from the same output', () => {
    const result = parseInspectOutput(SAMPLE_OUTPUT)
    expect(result).toEqual({ name: 'my-project', id: 'dpl_abc123XYZ' })
  })
})
