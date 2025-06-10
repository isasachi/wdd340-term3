const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

async function getMarketplaceByClassificationId(classification_id) {
  try {
    // 1. Get inventory items by classification
    const inventoryData = await pool.query(
      `SELECT * FROM public.inventory AS i 
       JOIN public.classification AS c 
       ON i.classification_id = c.classification_id
       WHERE i.classification_id = $1`,
      [classification_id]
    );

    // 2. Get post data for all those inventory items
    const postData = await pool.query(
      `SELECT * FROM public.posts 
       WHERE inv_id IN (
         SELECT inv_id FROM public.inventory WHERE classification_id = $1
       )`,
      [classification_id]
    );

    // 3. Group posts by inv_id (determine liked state and collect comments)
    const postsByInvId = {};
    for (const post of postData.rows) {
      if (!postsByInvId[post.inv_id]) {
        postsByInvId[post.inv_id] = {
          liked: false,
          comments: []
        };
      }

      // If *any* post has liked = true, consider the item liked
      if (post.liked) {
        postsByInvId[post.inv_id].liked = true;
      }

      if (post.comment) {
        postsByInvId[post.inv_id].comments.push(post.comment);
      }
    }

    // 4. Combine data
    const fullData = inventoryData.rows.map(item => {
      const postInfo = postsByInvId[item.inv_id] || { liked: false, comments: [] };
      return {
        ...item,
        liked: postInfo.liked,
        comments: postInfo.comments
      };
    });

    return fullData;

  } catch (error) {
    console.error("getMarketplaceByClassificationId error:", error);
    throw error;
  }
}

async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows[0]
  } catch (error) {
    console.error("getDetailByInvId error " + error)
  }
}

async function addClassification(classification_name) {
  try {
    const data = await pool.query(
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *",
      [classification_name]
    )
    return data
  } catch (error) {
    console.error("addClassification error: " + error.message)
  }
}

async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
  try {
    const sql = "INSERT INTO public.inventory (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
    return await pool.query(
      sql,
      [ inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id ]
    )
  } catch (error) {
    console.error("addInventory error: " + error.message)
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}

/* ***************************
 *  Delete Inventory Data
 * ************************** */

async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

async function addPostFeedback(liked, comment, inv_id, classification_id) {
  try {
    const sql = 'INSERT INTO posts (liked, comment, inv_id, classification_id) VALUES ($1, $2, $3, $4) RETURNING *'
    const data = await pool.query(sql, [liked, comment, inv_id, classification_id])
    return data
  } catch (error) {
    console.error("Error adding post feedback to database: " + error)
  }
}

module.exports = {getClassifications, getInventoryByClassificationId, getInventoryById, addClassification, addInventory, updateInventory, deleteInventory, addPostFeedback, getMarketplaceByClassificationId}
