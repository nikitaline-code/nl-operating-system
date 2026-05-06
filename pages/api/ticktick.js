import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
)

function cleanDate(value) {
  if (!value || String(value).includes('choose TickTick')) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return date.toISOString().split('T')[0]
}

function cleanPerson(value) {
  const allowed = ['Dawson', 'Zach', 'Dane', 'Nikita']

  return allowed.includes(value) ? value : 'Nikita'
}

function cleanPriority(value) {
  const v = String(value || '').toLowerCase()

  if (v.includes('high')) return 'High'
  if (v.includes('low')) return 'Low'

  return 'Medium'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const body = req.body || {}

    const externalId =
      body.id ||
      body.task_id ||
      body.ticktick_id ||
      null

    const taskName =
      body.title ||
      body.task ||
      body.name ||
      body.TaskName ||
      'Untitled TickTick Task'

    const row = {
      task: taskName,
      completed: false,
      priority: cleanPriority(body.priority),
      source: 'ticktick',
      external_id: externalId,
      assigned_to: cleanPerson(body.assigned_to),
      territory: 'South',
      due_date: cleanDate(body.due_date || body.EndDate),
      status: body.status || body.List || 'South Dealer Requests',
    }

    if (externalId) {
      const { data: existingTask, error: findError } = await supabase
        .from('Task List')
        .select('id')
        .eq('external_id', externalId)
        .limit(1)
        .maybeSingle()

      if (findError) throw findError

      if (existingTask) {
        const { data: updatedTask, error: updateError } = await supabase
          .from('Task List')
          .update(row)
          .eq('id', existingTask.id)
          .select()

        if (updateError) throw updateError

        return res.status(200).json({
          success: true,
          action: 'updated_existing',
          task: updatedTask,
        })
      }
    }

    const { data: newTask, error: insertError } = await supabase
      .from('Task List')
      .insert([row])
      .select()

    if (insertError) throw insertError

    return res.status(200).json({
      success: true,
      action: 'created_new',
      task: newTask,
    })
  } catch (err) {
    console.error('TickTick webhook error:', err)

    return res.status(500).json({
      success: false,
      error: err.message,
    })
  }
}
