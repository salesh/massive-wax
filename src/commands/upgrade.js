'use strict'

const { Command, flags } = require('@oclif/command')
const path = require('path')

const utils = require('../utils')
const Github = require('../github')
const GitDir = require('../git-repo')
const Wax = require('../wax')

const gkProcess = require('../processor/greenkeeper')

class UpgradeCommand extends Command {
  async run () {
    const { flags, argv } = this.parse(this.constructor)
    const gh = Github(flags.token)
    const wax = Wax()
    const git = GitDir(flags.cwd)

    const repos = utils.parseRepo(flags.repo)

    repos.forEach(async repo => {
      let cloneUrl = repo.href
      let clonePath = `${repo.owner}/${repo.repo}`

      if (flags.fork) {
        this.log(`Forking ${cloneUrl}`)
        const resp = await gh.fork(repo)
        cloneUrl = resp.clone_url
        clonePath = resp.full_name
        this.log(`Forked ${cloneUrl}`)
      }

      clonePath = path.join(flags.cwd, clonePath)
      this.log(`Cloning ${cloneUrl} to ${clonePath}`)
      await git.clone(cloneUrl, clonePath)

      // TODO processors
      // await wax.updateSourceCode(clonePath, gkProcess(argv, 'tap'))

      // const gitCloned = GitDir(clonePath)
      // await gitCloned.branch('wax')
      // await gitCloned.add('./*')
      // await gitCloned.commit({ message: 'wax in action', noVerify: true })
      // await gitCloned.push(['-u', 'origin', 'wax'])

      // const source = {
      //   head: `${resp.owner.login}:wax`,
      //   // head: `${resp.name}`,
      //   base: 'master'
      // }

      // try {
      //   await gh.openPR(repo, source, 'chore: greenkeeper ignore tap')
      // } catch (error) {
      //   console.log({ error: error.errors })
      // }
    })
  }
}

UpgradeCommand.description = `Describe the command here
...
Extra documentation goes here
`

UpgradeCommand.flags = {
  token: flags.string({
    char: 't',
    description: 'the GitHub token to fork the project and push the changes. You can set it via env named GITHUB_TOKEN',
    env: 'GITHUB_TOKEN',
    required: true
  }),
  repo: flags.string({
    char: 'r',
    description: 'the URL repo to upgrade. If it is a file, each line of the file must be a repo URL',
    required: true,
    multiple: true
  }),
  fork: flags.boolean({
    char: 'F',
    description: 'fork the project before cloning. Useful if you don\'t have the write grant',
    default: false
  }),
  cwd: flags.string({
    char: 'c',
    description: 'current working directory',
    default: process.cwd()
  }),
  match: flags.string({
    char: 'm',
    description: 'the files that match this pattern will be processed',
    default: '.js$|.json$'
  }),
  processor: flags.string({
    char: 'p',
    description: 'the processor(s) that will modify the cloned repo. It can be a file or a global package',
    required: true,
    multiple: true
  }),
  branch: flags.string({
    char: 'b',
    description: 'the branch name where apply the changes',
    default: 'wax'
  }),
  'pr-title': flags.string({
    char: 'T',
    description: 'the title of the PR',
    required: true
  }),
  'pr-body': flags.string({
    char: 'B',
    description: 'the body message of the PR',
    default: 'This is an automatic PR created with [massive-wax](https://github.com/Eomm/massive-wax)!'
  })
}

module.exports = UpgradeCommand
