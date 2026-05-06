import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
  },
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  try {
    const body = req.body || {}

    const taskName =
      body.title ||
      body.task ||
      body.name ||
      'Untitled TickTick Task'

    const dueDate =
      body.due_date && body.due_date !== 'choose TickTick due date'
        ? body.due_date
        : null

    const { data, error } = await supabase
      .from('Task List')
      .insert([
        {
          task: taskName,
          completed: false,
          priority: body.priority || 'Medium',
          source: 'ticktick',
          external_id: body.id || null,
          assigned_to: body.assigned_to || 'Mark',
          due_date: dueDate,
        },
      ])
      .select()

    if (error) {
      console.error('Supabase insert error:', error)
      return res.status(500).json({
        success: false,
        error: error.message,
      })
    }

    return res.status(200).json({
      success: true,
      task: data,
    })
  } catch (err) {
    console.error('TickTick webhook error:', err)

    return res.status(500).json({
      success: false,
      error: err.message,
    })
  }
}
