import Board from 'App/Models/Board'

type QueryStringProps = {
  lists: string
}

export const LoadBoardRelations = async (
  id: string,
  queryString: Record<string, any>
): Promise<Board> => {
  const board = await Board.findOrFail(id)

  await board.load('creator')

  await board.load('lists')

  const { lists } = queryString as unknown as QueryStringProps

  if (lists) await board.load('lists')

  return board
}
