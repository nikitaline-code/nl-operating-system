import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = req.body

    const { error } = await supabase
      .from('tasks')
      .insert([
        {
          title: body.title || 'Untitled Task',
          completed: false,
          priority: body.priority || 'Medium',
          source: 'ticktick',
          external_id: body.id || null,
          assigned_to: body.assigned_to || 'Mark',
          due_date: body.due_date || null
        }
      ])

    if (error) throw error

    res.status(200).json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
