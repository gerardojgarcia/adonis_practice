/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { Exception } from '@adonisjs/core/exceptions'
import app from '@adonisjs/core/services/app'
import router from '@adonisjs/core/services/router'

import fs from 'node:fs/promises'
import { MarkdownFile } from '@dimerapp/markdown'
import { toHtml } from '@dimerapp/markdown/utils'

router
  .get('/', async (ctx) => {
    const url = app.makeURL('resources/movies')
    const files = await fs.readdir(url)

    const slugs = files.map((file) => file.replace('.md', ''))

    return ctx.view.render('pages/home', { slugs })
  })
  .as('home')

router
  .get('/movies/:slug', async (ctx) => {
    const url = app.makeURL(`resources/movies/${ctx.params.slug}.md`)

    try {
      const file = await fs.readFile(url, 'utf8')
      const md = new MarkdownFile(file)
      await md.process()

      const movie = toHtml(md).contents

      ctx.view.share({ movie })
    } catch (error) {
      throw new Exception(`Could not find a movie called ${ctx.params.slug}`, {
        code: 'E_NOT_FOUND',

        status: 404,
      })
    }

    return ctx.view.render('pages/movies/show')
  })
  .as('movies.show')

  .where('slug', router.matchers.slug())
