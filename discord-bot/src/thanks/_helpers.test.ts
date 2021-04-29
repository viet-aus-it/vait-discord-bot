import { getOrCreateUser } from "./_helpers"

describe('getOrCreateUser', () => {
  it('should return user if user is existed', async () => {
    const mockPrisma: any = {
      user: {
        findUnique: () => ({ id: '1' })
      }
    }

    const user = await getOrCreateUser(mockPrisma, '1')
    expect(user.id).toBe('1')
  })

  it('should return user even if user is not existed', async () => {
    const mockPrisma: any = {
      user: {
        findUnique: () => null,
        create: () => ({ id: '1' })
      }
    }

    const user = await getOrCreateUser(mockPrisma, '1')
    expect(user.id).toBe('1')
  })
})