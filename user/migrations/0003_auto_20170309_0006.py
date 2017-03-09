# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2017-03-09 00:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_auto_20170309_0000'),
    ]

    operations = [
        migrations.CreateModel(
            name='RolePermission',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('permission_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='user.ChatPermission')),
            ],
        ),
        migrations.RemoveField(
            model_name='role',
            name='chat_permission_level',
        ),
        migrations.AddField(
            model_name='rolepermission',
            name='role_id',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='user.Role'),
        ),
    ]
