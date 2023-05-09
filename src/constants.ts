const BOPREFIX = 'bo_'
const HOPREFIX = 'ho'

const TABLENAME = 'achat'
const COLUMNLIST = [{ name: 'article', type: 'VARCHAR(255)' },
{ name: 'quantite', type: 'INT' },
{ name: 'prix', type: 'INT' },
{ name: 'date', type: 'DATE' }]

export { BOPREFIX, HOPREFIX, TABLENAME, COLUMNLIST }