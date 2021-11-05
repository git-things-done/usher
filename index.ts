import * as github from '@actions/github';
import { getInput } from '@actions/core';

const slug = process.env.GITHUB_REPOSITORY!
const [owner, repo] = slug.split('/')
const issue_number = parseInt((getInput('yesterday') || process.env.GTD_YESTERDAY)!)
const today = parseInt((getInput('today') || process.env.GTD_TODAY)!)
const token = getInput('token')!
const octokit = github.getOctokit(token)

const comments = await octokit.rest.issues.listComments({ owner, repo, issue_number })

for (const comment of comments.data) {
  const reactions = await octokit.rest.reactions.listForIssueComment({
    owner, repo, comment_id: comment.id
  })

  if (!reactions.data.map(rxn => rxn.content).includes('eyes')) continue;

  const new_comment = await octokit.rest.issues.createComment({
    owner, repo, issue_number: today, body: comment.body ?? ''
  })

  await octokit.rest.reactions.createForIssueComment({
    owner, repo, comment_id: new_comment.data.id, content: 'eyes'
  })
}
